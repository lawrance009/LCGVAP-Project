import { createElement, useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from 'lucide-react';
import api from '../services/api';
import getFileUrl from '../utils/getFileUrl';
import PremiumTag from '../components/profile/PremiumTag';
import { formatDegreeType, getPublicDegreeTypes, isPublicPremiumVeteran } from '../utils/degreeDisplay';
import { BRAND } from '../constants/branding';

const emptyFilters = {
  search: '',
  university_id: '',
  department_id: '',
  page: 1,
};

const MotionDiv = motion.div;

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
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState(emptyFilters);
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
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#0b1020] text-white">
        <div className="absolute inset-x-0 top-0 grid h-1 grid-cols-3" aria-hidden="true">
          <div className="bg-red-600"></div>
          <div className="bg-white"></div>
          <div className="bg-indigo-600"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(360px,0.62fr)] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-red-300">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Public Verified Registry
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Verified Graduate Directory
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Search approved Liberian graduates from Cyprus by name or university.
                Every record shown here has passed {BRAND.shortName} admin review.
              </p>
            </div>

            <div className="rounded-md bg-white/[0.06] p-4 shadow-xl shadow-indigo-950/20 backdrop-blur">
              <form onSubmit={handleSearch} className="space-y-3">
                <label htmlFor="directory-search" className="sr-only">
                  Search graduates by name
                </label>
                <div ref={searchContainerRef} className="relative">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    <input
                      id="directory-search"
                      type="text"
                      placeholder="Search by graduate name"
                      className="h-12 w-full rounded-md bg-white pl-12 pr-12 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-400/20"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setIsSearchFocused(true);
                      }}
                      onFocus={() => setIsSearchFocused(true)}
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={isSearchSuggestionsVisible}
                      aria-controls="directory-search-suggestions"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <SearchSuggestions
                    isVisible={isSearchSuggestionsVisible}
                    isLoading={loading}
                    isSettled={isSearchSettled}
                    suggestions={searchSuggestions}
                    searchTerm={searchTerm}
                    onSelect={handleSearchSuggestionSelect}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-[auto]">
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-red-600 px-5 text-sm font-bold text-white transition-colors hover:bg-red-700 sm:justify-self-start"
                  >
                    Search
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Directory Results
            </div>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {loading ? 'Searching verified records...' : `${meta.total.toLocaleString()} verified record${meta.total === 1 ? '' : 's'}`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterPanelOpen((open) => !open)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 lg:hidden"
              aria-expanded={isFilterPanelOpen}
              aria-controls="mobile-directory-filters"
            >
              {isFilterPanelOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              )}
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {filters.search && <FilterPill label={`Name: ${filters.search}`} />}
            {selectedUniversity && <FilterPill label={`University: ${selectedUniversity.name}`} />}
            {selectedDepartment && <FilterPill label={`Department: ${selectedDepartment.name}`} />}
            {!hasActiveFilters && <FilterPill label="All verified graduates" />}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <FilterPanel
          className="mb-6 hidden lg:grid"
          idPrefix="desktop-directory"
          universities={universities}
          departments={departments}
          filters={filters}
          departmentsLoading={departmentsLoading}
          onUniversityChange={handleUniversityChange}
          onDepartmentChange={handleDepartmentChange}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <AnimatePresence initial={false}>
          {isFilterPanelOpen && (
            <MotionDiv
              id="mobile-directory-filters"
              className="overflow-hidden lg:hidden"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <FilterPanel
                className="mb-6 grid"
                idPrefix="mobile-directory"
                universities={universities}
                departments={departments}
                filters={filters}
                departmentsLoading={departmentsLoading}
                onUniversityChange={handleUniversityChange}
                onDepartmentChange={handleDepartmentChange}
                onClear={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </MotionDiv>
          )}
        </AnimatePresence>

        {loading ? (
          <DirectorySkeleton />
        ) : graduates.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {graduates.map((graduate) => (
                <GraduateCard key={graduate.id} graduate={graduate} />
              ))}
            </div>

            <Pagination
              page={filters.page}
              totalPages={meta.totalPages}
              onPageChange={goToPage}
            />
          </>
        ) : (
          <EmptyState onClear={clearFilters} hasActiveFilters={hasActiveFilters} />
        )}
      </section>
    </div>
  );
};

const SearchSuggestions = ({
  isVisible,
  isLoading,
  isSettled,
  suggestions,
  searchTerm,
  onSelect,
}) => (
  <AnimatePresence initial={false}>
    {isVisible && (
      <MotionDiv
        id="directory-search-suggestions"
        className="mt-2 overflow-hidden rounded-md bg-white shadow-xl shadow-indigo-950/20 ring-1 ring-white/10"
        initial={{ opacity: 0, y: -6, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -6, height: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {(!isSettled || isLoading) && (
            <div className="flex min-h-12 items-center gap-3 px-3 text-sm font-semibold text-slate-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600"></span>
              Checking verified names...
            </div>
          )}

          {isSettled && !isLoading && suggestions.length > 0 && suggestions.map((graduate) => {
            const fullName = getGraduateFullName(graduate);

            return (
              <button
                key={graduate.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(graduate)}
                className="flex min-h-14 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-slate-950">
                    {fullName || 'Verified Graduate'}
                  </span>
                  <span className="block truncate text-xs font-semibold text-slate-500">
                    {graduate.university_name || 'University not listed'}
                  </span>
                </span>
                <BadgeCheck className="ml-auto h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />
              </button>
            );
          })}

          {isSettled && !isLoading && suggestions.length === 0 && (
            <div className="px-3 py-4 text-sm font-semibold text-slate-500">
              No verified name matches <span className="font-black text-slate-800">{searchTerm}</span>.
            </div>
          )}
        </div>
      </MotionDiv>
    )}
  </AnimatePresence>
);

const FilterPanel = ({
  className,
  idPrefix,
  universities,
  departments,
  filters,
  departmentsLoading,
  onUniversityChange,
  onDepartmentChange,
  onClear,
  hasActiveFilters,
}) => (
  <div className={`rounded-md bg-white p-4 shadow-sm shadow-slate-950/5 ${className}`}>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
      <UniversityDropdown
        id={`${idPrefix}-university-filter`}
        label="University"
        universities={universities}
        value={filters.university_id}
        onChange={onUniversityChange}
      />

      <DepartmentDropdown
        id={`${idPrefix}-department-filter`}
        label="Department"
        departments={departments}
        value={filters.department_id}
        onChange={onDepartmentChange}
        disabled={!filters.university_id || departmentsLoading || departments.length === 0}
        disabledText={
          !filters.university_id
            ? 'Select university first'
            : departmentsLoading
              ? 'Loading departments...'
              : departments.length === 0
                ? 'No departments available'
                : ''
        }
      />

      <button
        type="button"
        onClick={onClear}
        disabled={!hasActiveFilters}
        className="inline-flex h-12 items-center justify-center rounded-md bg-slate-100 px-5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 sm:col-span-2 lg:col-span-1"
      >
        Reset filters
      </button>
    </div>
  </div>
);

const UniversityDropdown = ({
  id,
  label,
  universities,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedUniversity = useMemo(
    () => universities.find((university) => String(university.id) === String(value)),
    [universities, value]
  );

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current || containerRef.current.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, []);

  const selectUniversity = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const optionClassName = (isSelected) => (
    `flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition-colors ${
      isSelected
        ? 'bg-indigo-50 text-indigo-800'
        : 'text-slate-700 hover:bg-slate-50'
    }`
  );

  return (
    <div ref={containerRef} className="min-w-0">
      <label
        id={`${id}-label`}
        htmlFor={`${id}-button`}
        className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500"
      >
        {label}
      </label>

      <button
        id={`${id}-button`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md bg-slate-50 px-4 text-left text-sm font-bold text-slate-800 outline-none transition-colors hover:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-600/10"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-button-value`}
        aria-controls={`${id}-listbox`}
      >
        <span id={`${id}-button-value`} className="min-w-0 truncate">
          {selectedUniversity?.name || 'All Universities'}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <MotionDiv
            className="mt-2 overflow-hidden rounded-md bg-white shadow-lg shadow-slate-950/10 ring-1 ring-slate-200/70"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              id={`${id}-listbox`}
              role="listbox"
              aria-labelledby={`${id}-label`}
              className="max-h-64 overflow-y-auto p-2 sm:max-h-72"
            >
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => selectUniversity('')}
                className={optionClassName(!value)}
              >
                <span className="truncate">All Universities</span>
                {!value && <Check className="h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />}
              </button>

              {universities.map((university) => {
                const isSelected = String(university.id) === String(value);

                return (
                  <button
                    key={university.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectUniversity(university.id)}
                    className={optionClassName(isSelected)}
                  >
                    <span className="min-w-0 truncate">{university.name}</span>
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />}
                  </button>
                );
              })}

              {universities.length === 0 && (
                <p className="px-3 py-4 text-sm font-semibold text-slate-500">
                  No universities available.
                </p>
              )}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const DepartmentDropdown = ({
  id,
  label,
  departments,
  value,
  onChange,
  disabled = false,
  disabledText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDepartment = useMemo(
    () => departments.find((department) => String(department.id) === String(value)),
    [departments, value]
  );

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current || containerRef.current.contains(event.target)) return;
      setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, []);

  const selectDepartment = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  const optionClassName = (isSelected) => (
    `flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition-colors ${
      isSelected
        ? 'bg-indigo-50 text-indigo-800'
        : 'text-slate-700 hover:bg-slate-50'
    }`
  );

  const buttonText = disabled
    ? disabledText
    : selectedDepartment?.name || 'All Departments';

  return (
    <div ref={containerRef} className="min-w-0">
      <label
        id={`${id}-label`}
        htmlFor={`${id}-button`}
        className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500"
      >
        {label}
      </label>

      <button
        id={`${id}-button`}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        disabled={disabled}
        className="flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-md bg-slate-50 px-4 text-left text-sm font-bold text-slate-800 outline-none transition-colors hover:bg-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-slate-50"
        aria-expanded={isOpen && !disabled}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}-button-value`}
        aria-controls={`${id}-listbox`}
      >
        <span id={`${id}-button-value`} className="min-w-0 truncate">
          {buttonText}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-500 transition-transform duration-300 ${isOpen && !disabled ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && !disabled && (
          <MotionDiv
            className="mt-2 overflow-hidden rounded-md bg-white shadow-lg shadow-slate-950/10 ring-1 ring-slate-200/70"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              id={`${id}-listbox`}
              role="listbox"
              aria-labelledby={`${id}-label`}
              className="max-h-64 overflow-y-auto p-2 sm:max-h-72"
            >
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => selectDepartment('')}
                className={optionClassName(!value)}
              >
                <span className="truncate">All Departments</span>
                {!value && <Check className="h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />}
              </button>

              {departments.map((department) => {
                const isSelected = String(department.id) === String(value);

                return (
                  <button
                    key={department.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectDepartment(department.id)}
                    className={optionClassName(isSelected)}
                  >
                    <span className="min-w-0 truncate">{department.name}</span>
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterPill = ({ label }) => (
  <span className="rounded-md bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
    {label}
  </span>
);

const DirectorySkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2, 3, 4, 5].map((item) => (
      <div key={item} className="rounded-md bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-4">
          <div className="h-16 w-16 animate-pulse rounded-md bg-slate-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full animate-pulse rounded bg-slate-100"></div>
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100"></div>
        </div>
      </div>
    ))}
  </div>
);

const GraduateCard = ({ graduate }) => {
  const degreeTypes = getPublicDegreeTypes(graduate);
  const fullName = `${graduate.first_name || ''} ${graduate.last_name || ''}`.trim();

  return (
    <article className="group flex min-h-[278px] flex-col rounded-md bg-white p-5 shadow-sm shadow-slate-950/5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/10">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-indigo-700">
            {graduate.profile_photo ? (
              <img
                src={getFileUrl(graduate.profile_photo)}
                alt={fullName || 'Verified graduate'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/70">
                <UserRound className="h-8 w-8" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-indigo-700">
              <BadgeCheck className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
              Verified
            </div>
            <h3 className="line-clamp-2 text-lg font-black leading-snug text-slate-950">
              {fullName || 'Verified Graduate'}
            </h3>
          </div>
        </div>

        {isPublicPremiumVeteran(graduate) && (
          <div className="flex-shrink-0">
            <PremiumTag isPremiumVeteran />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <RecordLine icon={Building2} label="University" value={graduate.university_name || 'University not listed'} />
        <RecordLine icon={GraduationCap} label="Department" value={graduate.department_name || 'Department not listed'} />
      </div>

      {degreeTypes.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {degreeTypes.map((type) => (
            <span
              key={type}
              className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-700"
            >
              {formatDegreeType(type)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-5">
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
          <div className="h-full w-2/3 bg-gradient-to-r from-red-600 via-indigo-600 to-sky-600"></div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Liberia to Cyprus
          </span>
          <Link
            to={`/directory/${graduate.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-800"
          >
            View profile
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

const RecordLine = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-slate-100 text-indigo-700">
      {createElement(Icon, {
        className: 'h-4 w-4',
        'aria-hidden': 'true',
      })}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </p>
    </div>
  </div>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Previous
      </button>

      <span className="rounded-md bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 shadow-sm">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

const EmptyState = ({ onClear, hasActiveFilters }) => (
  <div className="rounded-md bg-white px-5 py-14 text-center shadow-sm sm:px-8">
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
      <Search className="h-6 w-6" aria-hidden="true" />
    </div>
    <h2 className="text-2xl font-black text-slate-950">No verified records found.</h2>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
      Try another graduate name or select a different university from the registry.
    </p>
    {hasActiveFilters && (
      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-md bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
      >
        Clear search
      </button>
    )}
  </div>
);

export default Directory;
