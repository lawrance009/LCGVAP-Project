import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, FileX } from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import { Button, Container, EmptyState, Skeleton } from '../components/ui';

const NewsDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/news/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="max-w-3xl py-12" aria-busy="true" aria-label="Loading article">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-8 h-12 w-full" />
        <Skeleton className="mt-3 h-12 w-2/3" />
        <Skeleton className="mt-10 aspect-[16/9] w-full rounded-panel" />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={FileX}
          title="Article not found"
          description="It may have been removed, or the link is out of date."
          action={<Button to="/news" variant="secondary">Back to news</Button>}
        />
      </Container>
    );
  }

  // Defect fix (Sprint 3): the list already resolves uploads with getFileUrl;
  // the detail page used the raw path, so uploaded images did not load.
  const imageUrl = getFileUrl(post.image_url);
  const isBirthday = post.type === 'birthday' || post.is_birthday;

  return (
    <article className="pb-20">
      <Container className="max-w-3xl pt-8 lg:pt-12">
        <Link
          to="/news"
          className="inline-flex items-center gap-1 rounded-doc py-2.5 -my-2.5 text-caption font-semibold text-primary underline-offset-4 hover:underline"
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
          All news
        </Link>

        <header className="mt-8">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption">
            <span className="font-semibold text-accent">{isBirthday ? 'Celebration' : 'Announcement'}</span>
            {post.created_at && (
              <time dateTime={post.created_at} className="text-muted">
                {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            )}
          </p>
          <h1 className="mt-3 font-display text-headline font-semibold text-balance text-ink sm:text-display">
            {post.title}
          </h1>
          {post.subtitle && <p className="mt-4 text-lead text-muted">{post.subtitle}</p>}
        </header>
      </Container>

      {imageUrl && (
        <Container className="mt-10 max-w-5xl">
          <img src={imageUrl} alt="" className="aspect-[16/9] w-full rounded-panel bg-tint object-cover" />
        </Container>
      )}

      <Container className="mt-10 max-w-3xl">
        {/* CMS HTML. Not sanitised: logged as a security follow-up in docs/redesign/sprints.md. */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />

        <footer className="mt-14 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/news"
            className="inline-flex items-center gap-1 rounded-doc py-2.5 -my-2.5 text-caption font-semibold text-primary underline-offset-4 hover:underline"
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            All news
          </Link>
          {post.author_first && (
            <p className="text-caption text-muted">
              Posted by {post.author_first} {post.author_last}
            </p>
          )}
        </footer>
      </Container>
    </article>
  );
};

export default NewsDetail;
