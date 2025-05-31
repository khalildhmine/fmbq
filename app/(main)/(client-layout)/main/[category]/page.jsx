'use client';

import { useRouter } from 'next/navigation';

export default function CategoryPage({ params }) {
  const { category } = params;

  return (
    <div>
      <h1>Category: {category}</h1>
    </div>
  );
}
