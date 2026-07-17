import Link from "next/link";

type PaginationProps = {
  basePath: string;
  page: number;
  q: string;
  totalPages: number;
};

export function Pagination({ basePath, page, q, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const qs = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Paginacion">
      <Link className="ui-button-secondary min-h-10 px-4 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50" href={qs(Math.max(1, page - 1))} aria-disabled={page <= 1}>
        Anterior
      </Link>
      <span className="ui-label">
        {page} / {totalPages}
      </span>
      <Link
        className="ui-button-secondary min-h-10 px-4 text-sm aria-disabled:pointer-events-none aria-disabled:opacity-50"
        href={qs(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
      >
        Siguiente
      </Link>
    </nav>
  );
}
