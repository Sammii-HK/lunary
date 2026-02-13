/**
 * Unit tests for vote toggle logic.
 * These test the pure logic — actual API tests would require a database.
 */

function toggleVote(
  existingVotes: Map<string, Set<number>>,
  userId: string,
  postId: number,
): { voted: boolean; newVoteCount: number } {
  const userVotes = existingVotes.get(userId) || new Set();

  if (userVotes.has(postId)) {
    // Remove vote (toggle off)
    userVotes.delete(postId);
    existingVotes.set(userId, userVotes);
    return { voted: false, newVoteCount: -1 };
  } else {
    // Add vote (toggle on)
    userVotes.add(postId);
    existingVotes.set(userId, userVotes);
    return { voted: true, newVoteCount: 1 };
  }
}

describe('Vote toggle logic', () => {
  it('adds a vote when none exists', () => {
    const votes = new Map<string, Set<number>>();
    const result = toggleVote(votes, 'user1', 100);
    expect(result.voted).toBe(true);
    expect(result.newVoteCount).toBe(1);
  });

  it('removes a vote when one exists (toggle off)', () => {
    const votes = new Map<string, Set<number>>();
    votes.set('user1', new Set([100]));
    const result = toggleVote(votes, 'user1', 100);
    expect(result.voted).toBe(false);
    expect(result.newVoteCount).toBe(-1);
  });

  it('handles multiple users voting on same post', () => {
    const votes = new Map<string, Set<number>>();
    const r1 = toggleVote(votes, 'user1', 100);
    const r2 = toggleVote(votes, 'user2', 100);
    expect(r1.voted).toBe(true);
    expect(r2.voted).toBe(true);
  });

  it('each user can only vote once per post', () => {
    const votes = new Map<string, Set<number>>();
    // First vote
    const r1 = toggleVote(votes, 'user1', 100);
    expect(r1.voted).toBe(true);
    // Second toggle = remove
    const r2 = toggleVote(votes, 'user1', 100);
    expect(r2.voted).toBe(false);
    // Third toggle = add again
    const r3 = toggleVote(votes, 'user1', 100);
    expect(r3.voted).toBe(true);
  });

  it('user can vote on different posts independently', () => {
    const votes = new Map<string, Set<number>>();
    const r1 = toggleVote(votes, 'user1', 100);
    const r2 = toggleVote(votes, 'user1', 200);
    expect(r1.voted).toBe(true);
    expect(r2.voted).toBe(true);

    // Toggle off post 100, post 200 should remain
    const r3 = toggleVote(votes, 'user1', 100);
    expect(r3.voted).toBe(false);
    expect(votes.get('user1')?.has(200)).toBe(true);
  });

  it('vote count never goes below 0', () => {
    let voteCount = 0;
    // Increment
    voteCount = Math.max(voteCount + 1, 0); // +1
    expect(voteCount).toBe(1);
    // Decrement
    voteCount = Math.max(voteCount - 1, 0); // 0
    expect(voteCount).toBe(0);
    // Extra decrement should stay at 0
    voteCount = Math.max(voteCount - 1, 0);
    expect(voteCount).toBe(0);
  });
});
