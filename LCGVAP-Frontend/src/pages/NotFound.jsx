import { MapPinOff } from 'lucide-react';
import { Button, Container, EmptyState } from '../components/ui';

/** Any unknown public address. Rendered inside the public layout. */
const NotFound = () => (
  <Container className="py-20 lg:py-28">
    <EmptyState
      icon={MapPinOff}
      title="This page is not on the register"
      description="The address may be mistyped, or the page has moved. Search for a graduate or go back to the home page."
      action={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button to="/directory">Search the register</Button>
          <Button to="/" variant="secondary">Go to the home page</Button>
        </div>
      }
    />
  </Container>
);

export default NotFound;
