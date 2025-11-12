type SaveConversationSnippetResponse = {
  ok: boolean;
};

export const saveConversationSnippet = async (
  userId: string,
  snippet: string,
): Promise<SaveConversationSnippetResponse> => {
  console.info('[AI Tools] saveConversationSnippet (stub)', {
    userId,
    snippet,
  });
  return { ok: true };
};

export const getDailyHighlight = async (userId: string) => {
  console.info('[AI Tools] getDailyHighlight (stub)', { userId });
  return null;
};

export const searchDocs = async (query: string) => {
  console.info('[AI Tools] searchDocs (stub)', { query });
  return { snippets: [] };
};
