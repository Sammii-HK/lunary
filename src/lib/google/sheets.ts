import { google } from 'googleapis';

const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Get authenticated Google Sheets client
 * Uses OAuth2 with refresh token (same credentials as YouTube)
 */
function getSheetsClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google Sheets OAuth credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in environment variables.',
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  // Set credentials with refresh token
  // The OAuth2 client will automatically refresh the access token when needed
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  // Add error handler for token refresh failures
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.log('[Sheets] New refresh token received');
    }
  });

  return google.sheets({
    version: 'v4',
    auth: oauth2Client,
  });
}

export interface SheetRow {
  [key: string]: string | number | null | undefined;
}

/**
 * Get or create a sheet tab
 */
export async function getOrCreateSheet(
  spreadsheetId: string,
  sheetName: string,
): Promise<number> {
  const sheets = getSheetsClient();

  try {
    // Get spreadsheet metadata
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Check if sheet exists
    const existingSheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName,
    );

    if (existingSheet?.properties?.sheetId !== undefined) {
      return existingSheet.properties.sheetId as number;
    }

    // Create new sheet
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });

    const newSheetId =
      response.data.replies?.[0]?.addSheet?.properties?.sheetId;
    if (newSheetId === undefined) {
      throw new Error(`Failed to create sheet: ${sheetName}`);
    }

    return newSheetId as number;
  } catch (error: any) {
    console.error(`[Sheets] Error getting/creating sheet ${sheetName}:`, error);
    throw new Error(
      `Failed to get or create sheet "${sheetName}": ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Ensure headers exist in a sheet
 */
export async function ensureHeaders(
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    // Get sheet ID
    const sheetId = await getOrCreateSheet(spreadsheetId, sheetName);

    // Check if headers already exist
    const range = `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`;
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    if (existing.data.values && existing.data.values.length > 0) {
      // Headers exist, check if they match
      const existingHeaders = existing.data.values[0] || [];
      if (
        existingHeaders.length === headers.length &&
        existingHeaders.every((h, i) => h === headers[i])
      ) {
        return; // Headers match, no update needed
      }
    }

    // Write headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });
  } catch (error: any) {
    console.error(`[Sheets] Error ensuring headers for ${sheetName}:`, error);
    throw new Error(
      `Failed to ensure headers in "${sheetName}": ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Upsert row by key column (idempotent write)
 * Finds existing row by matching keyColumn value, updates if exists, appends if not
 */
export async function upsertRow(
  spreadsheetId: string,
  sheetName: string,
  row: SheetRow,
  keyColumn: string,
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    // Ensure sheet exists
    await getOrCreateSheet(spreadsheetId, sheetName);

    // Get all data to find existing row
    const range = `${sheetName}!A:Z`;
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      throw new Error(
        `Sheet ${sheetName} has no headers. Call ensureHeaders first.`,
      );
    }

    const headers = rows[0] as string[];
    const keyColumnIndex = headers.indexOf(keyColumn);

    if (keyColumnIndex === -1) {
      throw new Error(`Key column "${keyColumn}" not found in sheet headers`);
    }

    // Find existing row
    const keyValue = row[keyColumn];
    let existingRowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i]?.[keyColumnIndex] === String(keyValue)) {
        existingRowIndex = i + 1; // 1-indexed for Sheets API
        break;
      }
    }

    // Prepare row values in header order
    const rowValues = headers.map((header) => {
      const value = row[header];
      return value === null || value === undefined ? '' : String(value);
    });

    if (existingRowIndex > 0) {
      // Update existing row
      const range = `${sheetName}!A${existingRowIndex}:${String.fromCharCode(64 + headers.length)}${existingRowIndex}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: [rowValues],
        },
      });
    } else {
      // Append new row
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [rowValues],
        },
      });
    }
  } catch (error: any) {
    console.error(`[Sheets] Error upserting row in ${sheetName}:`, error);
    throw new Error(
      `Failed to upsert row in "${sheetName}": ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Append multiple rows to a sheet
 */
export async function appendRows(
  spreadsheetId: string,
  sheetName: string,
  rows: SheetRow[],
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    // Ensure sheet exists
    await getOrCreateSheet(spreadsheetId, sheetName);

    // Get headers
    const range = `${sheetName}!A1:Z1`;
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const headers = (headerResponse.data.values?.[0] || []) as string[];
    if (headers.length === 0) {
      throw new Error(
        `Sheet ${sheetName} has no headers. Call ensureHeaders first.`,
      );
    }

    // Prepare row values in header order
    const rowValues = rows.map((row) =>
      headers.map((header) => {
        const value = row[header];
        return value === null || value === undefined ? '' : String(value);
      }),
    );

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rowValues,
      },
    });
  } catch (error: any) {
    console.error(`[Sheets] Error appending rows to ${sheetName}:`, error);
    throw new Error(
      `Failed to append rows to "${sheetName}": ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Update a cell value
 */
export async function updateCell(
  spreadsheetId: string,
  sheetName: string,
  cell: string,
  value: string | number,
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${cell}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[String(value)]],
      },
    });
  } catch (error: any) {
    console.error(
      `[Sheets] Error updating cell ${cell} in ${sheetName}:`,
      error,
    );
    throw new Error(
      `Failed to update cell "${cell}" in "${sheetName}": ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Clear all data in a sheet (keeps headers)
 */
export async function clearSheet(
  spreadsheetId: string,
  sheetName: string,
): Promise<void> {
  const sheets = getSheetsClient();

  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A2:Z10000`, // Clear data but keep row 1 (headers)
    });
  } catch (error: any) {
    console.error(`[Sheets] Error clearing sheet ${sheetName}:`, error);
    throw new Error(
      `Failed to clear sheet "${sheetName}": ${error.message || 'Unknown error'}`,
    );
  }
}
