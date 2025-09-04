import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Single post scheduler started');
    
    const { postData, succulentApiUrl, testMode } = await request.json();
    console.log('📥 Request data received:', { succulentApiUrl, testMode, hasPostData: !!postData });

    // Get environment variables
    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
    
    // Get the base URL for the application (dev vs prod)
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://lunary.app' 
      : 'http://localhost:3000';

    console.log('🔑 Environment check:', { 
      hasApiKey: !!apiKey, 
      hasAccountGroupId: !!accountGroupId,
      apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'missing',
      baseUrl,
      nodeEnv: process.env.NODE_ENV
    });

    if (!apiKey || !accountGroupId) {
      console.error('❌ Missing environment variables');
      return NextResponse.json(
        {
          success: false,
          message: 'Missing Succulent API configuration',
          error:
            'SUCCULENT_SECRET_KEY or SUCCULENT_ACCOUNT_GROUP_ID not found in environment variables',
        },
        { status: 500 },
      );
    }

    // Ensure mediaItems URLs use the correct base URL
    const updatedMediaItems = postData.mediaItems?.map((item: any) => ({
      ...item,
      // Replace any localhost or relative URLs with the correct base URL
      url: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`
    })) || [];

    console.log('🖼️ Media items:', updatedMediaItems);

    // Use real account group ID and ensure proper URLs
    const finalPostData = {
      ...postData,
      accountGroupId,
      mediaItems: updatedMediaItems,
    };

    console.log('📤 Sending to Succulent:', succulentApiUrl);
    console.log('📋 Post Data (full):', {
      accountGroupId: finalPostData.accountGroupId,
      content: finalPostData.content,
      platforms: finalPostData.platforms,
      scheduledDate: finalPostData.scheduledDate,
      mediaItems: finalPostData.mediaItems,
    });

    // Send to Succulent API - let Succulent handle the image URL
    console.log('🌐 Making request to Succulent API...');
    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(finalPostData),
    });

    console.log('📨 Succulent Response Status:', response.status);
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('📨 Succulent Response Data:', responseData);
    } catch (jsonError) {
      console.error('❌ Failed to parse Succulent response as JSON:', jsonError);
      const responseText = await response.text();
      console.error('📄 Raw response text:', responseText);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from Succulent API',
          error: `Failed to parse response: ${jsonError instanceof Error ? jsonError.message : 'Unknown JSON parsing error'}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            responseText: responseText.substring(0, 500)
          }
        },
        { status: 500 },
      );
    }

    if (response.ok) {
      console.log('✅ Success! Post scheduled successfully');
      return NextResponse.json({
        success: true,
        message: `Today's cosmic post scheduled successfully!`,
        summary: {
          totalPosts: 1,
          successful: 1,
          failed: 0,
          scheduledFor: postData.scheduledDate,
        },
        results: [
          {
            date: postData.scheduledDate.split('T')[0],
            status: 'success',
            postId: responseData.data?.postId || 'unknown',
            platforms: postData.platforms,
            imageUrl: finalPostData.mediaItems?.[0]?.url,
          },
        ],
        postContent: postData.content,
        succulentResponse: responseData,
      });
    } else {
      console.error('❌ Succulent API returned error:', response.status, responseData);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to schedule post to Succulent',
          error: responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          summary: {
            totalPosts: 1,
            successful: 0,
            failed: 1,
          },
          results: [
            {
              date: postData.scheduledDate.split('T')[0],
              status: 'error',
              error: responseData.error || `HTTP ${response.status}`,
            },
          ],
          succulentResponse: responseData,
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error('💥 Single post scheduler error:', error);
    console.error('📍 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Provide more specific error information
    let errorMessage = 'Unknown error occurred';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack?.substring(0, 1000) // Limit stack trace length
      };
    }
    
    // Check for specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error: Failed to connect to Succulent API';
      errorDetails = { ...errorDetails, type: 'network_error' };
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Data parsing error: Invalid request format';
      errorDetails = { ...errorDetails, type: 'parsing_error' };
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process single post',
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 },
    );
  }
}
