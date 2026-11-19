import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import { BRAND } from '../constants/branding';
import PageHero from '../components/PageHero';
import { Button, Container, EmptyState } from '../components/ui';
import DirectorySearch from './directory/DirectorySearch';
import DirectoryFilters from './directory/DirectoryFilters';
import GraduateList, { GraduateListSkeleton } from './directory/GraduateList';

const emptyFilters = {
  search: '',
  university_id: '',
  department_id: '',
  page: 1,
};

const getGraduateFullName = (graduate) => `${graduate.first_name || ''} ${graduate.last_name || ''}`.trim();

const Directory = () => {
  const [graduates, setGraduates] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  // Enabling change (Sprint 2): the home hero search hands off via ?search=.
  const [searchParams] = useSearchParams();
  const initialSearch = (searchParams.get('search') || '').trim();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [filters, setFilters] = useState(() => ({ ...emptyFilters, search: initialSearch }));
  const searchContainerRef = useRef(null);

  const selectedUniversity = useMemo(
    () => universities.find((uni) => String(uni.id) === String(filters.university_id)),
    [filters.university_id, universities]
  );

  const selectedDepartment = useMemo(
    () => departments.find((department) => String(department.id) === String(filters.department_id)),
    [departments, filters.department_id]
  );

  const hasActiveFilters = Boolean(filters.search || filters.university_id || filters.department_id);
  const activeFilterCount = [filters.search, filters.university_id, filters.department_id].filter(Boolean).length;
  const searchTerm = searchInput.trim();
  const normalizedSearchTerm = searchTerm.toLowerCase();
  const isSearchSettled = searchTerm === filters.search;
  const isSearchSuggestionsVisible = isSearchFocused && searchTerm.length > 0;

  const searchSuggestions = useMemo(() => {
    if (!normalizedSearchTerm || !isSearchSettled) return [];

    return graduates
      .filter((graduate) => getGraduateFullName(graduate).toLowerCase().includes(normalizedSearchTerm))
      .slice(0, 5);
  }, [graduates, isSearchSettled, normalizedSearchTerm]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await api.get('/universities');
        setUniversities(response.data || []);
      } catch (error) {
        console.error('Failed to fetch universities', error);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    let active = true;

    const fetchDepartments = async () => {
      if (!filters.university_id) {
        setDepartments([]);
        setDepartmentsLoading(false);
        return;
      }

      setDepartmentsLoading(true);
      try {
        const response = await api.get(`/universities/${filters.university_id}/departments`);
        if (active) setDepartments(response.data || []);
      } catch (error) {
        console.error('Failed to fetch departments', error);
        if (active) setDepartments([]);
      } finally {
        if (active) setDepartmentsLoading(false);
      }
    };

    fetchDepartments();

    return () => {
      active = false;
    };
  }, [filters.university_id]);

  useEffect(() => {
    const closeSearchOnOutsideClick = (event) => {
      if (!searchContainerRef.current || searchContainerRef.current.contains(event.target)) return;
      setIsSearchFocused(false);
    };

    document.addEventListener('pointerdown', closeSearchOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeSearchOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    const debounceMs = searchInput.trim() ? 280 : 120;
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      setFilters((current) => {
        if (current.search === nextSearch && current.page === 1) return current;

        return {
          ...current,
          search: nextSearch,
          page: 1,
        };
      });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchGraduates(filters);
  }, [filters]);

  const fetchGraduates = async (activeFilters) => {
    setLoading(true);

    try {
      const params = new URLSearchParams(activeFilters);
      if (!activeFilters.search) params.delete('search');
      if (!activeFilters.university_id) params.delete('university_id');
      if (!activeFilters.department_id) params.delete('department_id');

      const response = await api.get(`/users?${params.toString()}`);
      setGraduates(response.data.data || []);
      setMeta({
        page: response.data.meta?.page || activeFilters.page || 1,
        total: response.data.meta?.total || 0,
        totalPages: response.data.meta?.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to fetch graduates', error);
      setGraduates([]);
      setMeta((current) => ({ ...current, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((current) => ({
      ...current,
      search: searchInput.trim(),
      page: 1,
    }));
    setIsSearchFocused(searchInput.trim().length > 0);
  };

  const handleSearchSuggestionSelect = (graduate) => {
    const fullName = getGraduateFullName(graduate);
    setSearchInput(fullName);
    setFilters((current) => ({
      ...current,
      search: fullName,
      page: 1,
    }));
    setIsSearchFocused(false);
  };

  const clearSearch = () => {
    setSearchInput('');
    setFilters((current) => ({
      ...current,
      search: '',
      page: 1,
    }));
    setIsSearchFocused(false);
  };

  const handleUniversityChange = (value) => {
    setFilters((current) => ({
      ...current,
      university_id: value,
      department_id: '',
      page: 1,
    }));
  };

  const handleDepartmentChange = (value) => {
    setFilters((current) => ({
      ...current,
      department_id: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters(emptyFilters);
    setIsFilterPanelOpen(false);
  };

  const goToPage = (page) => {
    setFilters((current) => ({ ...current, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHero
        title="Search the register"
        lead={`Every graduate listed here has passed ${BRAND.shortName} verification. Search by name, or narrow the list by university and department.`}
      >
        <DirectorySearch
          containerRef={searchContainerRef}
          value={searchInput}
          onValueChange={(value) => {
            setSearchInput(value);
            setIsSearchFocused(true);
          }}
          onFocus={() => setIsSearchFocused(true)}
          onSubmit={handleSearch}
          onClear={clearSearch}
          suggestions={searchSuggestions}
          suggestionsVisible={isSearchSuggestionsVisible}
          suggestionsLoading={loading}
          suggestionsSettled={isSearchSettled}
          searchTerm={searchTerm}
          onSelectSuggestion={handleSearchSuggestionSelect}
        />
      </PageHero>

      <Container as="section" aria-labelledby="results-title" className="py-10 lg:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <h2 id="results-title" aria-live="polite" className="font-display text-heading font-semibold text-ink">
              {loading
                ? 'Searching the register…'
                : `${meta.total.toLocaleString()} verified ${meta.total === 1 ? 'graduate' : 'graduates'}`}
            </h2>
            <Button
              variant="secondary"
              leadingIcon={isFilterPanelOpen ? X : SlidersHorizontal}
              onClick={() => setIsFilterPanelOpen((open) => !open)}
              aria-expanded={isFilterPanelOpen}
              aria-controls="directory-filters"
              className="lg:hidden"
            >
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>

          <DirectoryFilters
            id="directory-filters"
            open={isFilterPanelOpen}
            universities={universities}
            departments={departments}
            filters={filters}
            departmentsLoading={departmentsLoading}
            onUniversityChange={handleUniversityChange}
            onDepartmentChange={handleDepartmentChange}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {filters.search && <FilterChip label={`Name: ${filters.search}`} onRemove={clearSearch} />}
            {selectedUniversity && (
              <FilterChip label={selectedUniversity.name} onRemove={() => handleUniversityChange('')} />
            )}
            {selectedDepartment && (
              <FilterChip label={selectedDepartment.name} onRemove={() => handleDepartmentChange('')} />
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        <div className="mt-8" aria-busy={loading || undefined}>
          {loading ? (
            <GraduateListSkeleton />
          ) : graduates.length > 0 ? (
            <>
              <GraduateList graduates={graduates} />
              <Pagination page={filters.page} totalPages={meta.totalPages} onPageChange={goToPage} />
            </>
          ) : (
            <EmptyState
              icon={SearchX}
              title={hasActiveFilters ? 'No graduates match this search' : 'The register is empty'}
              description={
                hasActiveFilters
                  ? 'Check the spelling of the name, or choose a different university or department.'
                  : 'Verified graduates appear here once an administrator approves their records.'
              }
              action={
                hasActiveFilters && (
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear search and filters
                  </Button>
                )
              }
            />
          )}
        </div>
      </Container>
    </>
  );
};

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex h-8 max-w-full items-center gap-1 rounded-doc border border-line bg-paper pr-1 pl-3 text-caption font-medium text-ink">
    <span className="truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="flex size-6 shrink-0 items-center justify-center rounded-doc text-muted hover:bg-tint hover:text-ink"
    >
      <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
    </button>
  </span>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-between gap-3 sm:justify-center sm:gap-6">
      <Button variant="secondary" leadingIcon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <p className="text-caption text-muted tabular-nums" aria-current="page">
        Page {page} of {totalPages}
      </p>
      <Button
        variant="secondary"
        trailingIcon={ChevronRight}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
};

export default Directory;
