import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { Heading } from '@/components/ui/Heading';
import { SignupCTA } from '@/components/community/SignupCTA';
import { QuestionDetailClient } from './QuestionDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

async function getQuestion(id: number) {
  const questionResult = await sql`
    SELECT q.id, q.user_id, q.post_text, q.is_anonymous, q.vote_count, q.topic_tag, q.created_at,
      (SELECT name FROM user_profiles WHERE user_id = q.user_id LIMIT 1) AS author_name
    FROM community_posts q
    WHERE q.id = ${id} AND q.post_type = 'question' AND q.is_approved = true
    LIMIT 1
  `;

  if (questionResult.rows.length === 0) return null;

  const q = questionResult.rows[0];

  const answersResult = await sql`
    SELECT a.id, a.user_id, a.post_text, a.is_anonymous, a.vote_count, a.best_answer, a.created_at,
      (SELECT name FROM user_profiles WHERE user_id = a.user_id LIMIT 1) AS author_name
    FROM community_posts a
    WHERE a.parent_id = ${id} AND a.post_type = 'answer' AND a.is_approved = true
    ORDER BY a.best_answer DESC, a.vote_count DESC, a.created_at ASC
  `;

  return {
    question: {
      id: q.id,
      userId: q.user_id,
      text: q.post_text,
      isAnonymous: q.is_anonymous,
      authorName: q.is_anonymous ? null : q.author_name,
      voteCount: q.vote_count ?? 0,
      topicTag: q.topic_tag,
      createdAt: q.created_at ? new Date(q.created_at).toISOString() : null,
    },
    answers: answersResult.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      text: row.post_text,
      isAnonymous: row.is_anonymous,
      authorName: row.is_anonymous ? null : row.author_name,
      voteCount: row.vote_count ?? 0,
      isBestAnswer: row.best_answer ?? false,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    })),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const questionId = parseInt(id);
  if (isNaN(questionId)) return {};

  const data = await getQuestion(questionId);
  if (!data) return {};

  const truncatedText =
    data.question.text.length > 120
      ? data.question.text.slice(0, 120) + '...'
      : data.question.text;

  return {
    title: `${truncatedText} - Ask the Circle | Lunary`,
    description: `${data.question.text.slice(0, 160)} — ${data.answers.length} answer${data.answers.length !== 1 ? 's' : ''} from the Lunary community.`,
    alternates: {
      canonical: `https://lunary.app/community/questions/${id}`,
    },
    openGraph: {
      title: `${truncatedText} - Ask the Circle | Lunary`,
      description: `${data.question.text.slice(0, 160)}`,
      url: `https://lunary.app/community/questions/${id}`,
    },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { id } = await params;
  const questionId = parseInt(id);
  if (isNaN(questionId)) notFound();

  const data = await getQuestion(questionId);
  if (!data) notFound();

  const headersList = await headers();
  const session = await auth.api
    .getSession({ headers: headersList })
    .catch(() => null);
  const isAuthenticated = !!session?.user?.id;
  const currentUserId = session?.user?.id || null;

  // JSON-LD structured data for SEO
  const bestAnswer = data.answers.find((a) => a.isBestAnswer);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: data.question.text,
      text: data.question.text,
      dateCreated: data.question.createdAt,
      answerCount: data.answers.length,
      ...(bestAnswer
        ? {
            acceptedAnswer: {
              '@type': 'Answer',
              text: bestAnswer.text,
              dateCreated: bestAnswer.createdAt,
            },
          }
        : data.answers.length > 0
          ? {
              suggestedAnswer: data.answers.slice(0, 3).map((a) => ({
                '@type': 'Answer',
                text: a.text,
                dateCreated: a.createdAt,
                upvoteCount: a.voteCount,
              })),
            }
          : {}),
    },
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 p-4'>
        <div className='max-w-2xl mx-auto space-y-6'>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <header className='pt-4 pb-2'>
            <Heading variant='h1' as='h1'>
              {data.question.text}
            </Heading>
            <div className='flex items-center gap-3 mt-2 text-xs text-zinc-500'>
              {data.question.topicTag && (
                <span className='px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400'>
                  {data.question.topicTag}
                </span>
              )}
              <span>
                {data.question.isAnonymous
                  ? 'Anonymous'
                  : data.question.authorName || 'Unknown'}
              </span>
              <span>{data.answers.length} answers</span>
            </div>
          </header>

          {!isAuthenticated && <SignupCTA />}

          <QuestionDetailClient
            question={data.question}
            answers={data.answers}
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
