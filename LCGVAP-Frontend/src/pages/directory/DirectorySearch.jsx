import { LoaderCircle, Search, X } from 'lucide-react';
import getFileUrl from '../../utils/getFileUrl';
import { Avatar, Button, Seal } from '../../components/ui';

const fullNameOf = (graduate) => `${graduate.first_name || ''} ${graduate.last_name || ''}`.trim();

/**
 * Register search bar with name suggestions. All state lives in Directory.jsx;
 * this only renders. Suggestions are a plain list of buttons (Tab-reachable),
 * not an ARIA combobox, because there is no arrow-key navigation to back it.
 */
export default function DirectorySearch({
  containerRef,
  value,
  onValueChange,
  onFocus,
  onSubmit,
  onClear,
  suggestions,
  suggestionsVisible,
  suggestionsLoading,
  suggestionsSettled,
  searchTerm,
  onSelectSuggestion,
}) {
  return (
    <form role="search" onSubmit={onSubmit} className="max-w-2xl">
      <label htmlFor="directory-search" className="text-caption font-semibold text-paper">
        Search by graduate name
      </label>
      <div ref={containerRef} className="relative mt-2">
        <div className="flex gap-1.5 rounded-panel bg-paper p-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-paper">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <input
              id="directory-search"
              type="search"
              value={value}
              onChange={(event) => onValueChange(event.target.value)}
              onFocus={onFocus}
              placeholder="Ruth Kollie"
              autoComplete="off"
              aria-describedby={suggestionsVisible ? 'directory-search-suggestions' : undefined}
              className="h-11 w-full rounded-doc bg-paper pr-10 pl-11 text-body text-ink placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {value && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Clear search"
                className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-doc text-muted hover:bg-tint hover:text-ink"
              >
                <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            )}
          </div>
          <Button type="submit" variant="accent" leadingIcon={Search} className="shrink-0">
            Search
          </Button>
        </div>

        {suggestionsVisible && (
          <div
            id="directory-search-suggestions"
            className="absolute inset-x-0 top-full z-20 mt-2 animate-rise overflow-hidden rounded-panel border border-line bg-paper text-ink shadow-overlay"
            style={{ animationDuration: '180ms' }}
          >
            {(!suggestionsSettled || suggestionsLoading) && (
              <p className="flex items-center gap-2 px-4 py-3 text-caption text-muted" role="status">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Checking the register…
              </p>
            )}

            {suggestionsSettled && !suggestionsLoading && suggestions.length > 0 && (
              <ul aria-label="Matching graduates" className="max-h-72 overflow-y-auto py-1">
                {suggestions.map((graduate) => {
                  const fullName = fullNameOf(graduate);
                  return (
                    <li key={graduate.id}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelectSuggestion(graduate)}
                        className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left hover:bg-tint focus-visible:bg-tint"
                      >
                        <Avatar
                          name={fullName}
                          src={graduate.profile_photo ? getFileUrl(graduate.profile_photo) : null}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{fullName || 'Verified graduate'}</span>
                          <span className="block truncate text-caption text-muted">
                            {graduate.university_name || 'University not listed'}
                          </span>
                        </span>
                        <Seal size="xs" tilted={false} decorative />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {suggestionsSettled && !suggestionsLoading && suggestions.length === 0 && (
              <p className="px-4 py-3 text-caption text-muted" role="status">
                No verified graduate named <span className="font-semibold text-ink">{searchTerm}</span>.
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
