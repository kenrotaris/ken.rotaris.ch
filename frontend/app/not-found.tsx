import { redirect } from 'next/navigation';

export default function NotFound() {
  console.log('404 - Page not found, redirecting to home');
  redirect('/');
}
