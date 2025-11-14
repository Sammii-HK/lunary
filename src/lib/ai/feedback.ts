export type FeedbackPayload = {
  userId: string;
  threadId?: string;
  messageId?: string;
  helpful: boolean;
  comment?: string;
  origin?: string;
};

type StoredFeedback = FeedbackPayload & {
  createdAt: string;
};

const feedbackStore: StoredFeedback[] = [];

export const recordFeedback = async (
  payload: FeedbackPayload,
): Promise<void> => {
  const entry: StoredFeedback = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  feedbackStore.push(entry);
  console.info('[AI Feedback] Recorded feedback', entry);
};

export const getFeedbackStore = (): StoredFeedback[] => feedbackStore;
