// src/app/user/[id]/page.tsx
import { useParams } from 'next/navigation';

export default function UserPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div>
      <h1>User Profile</h1>
      <p>User ID: {id}</p>
    </div>
  );
}
