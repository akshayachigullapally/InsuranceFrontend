import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PerilsState } from './perils.state';

const selectPerilsState = createFeatureSelector<PerilsState>('perils');

const selectPerils = createSelector(selectPerilsState, (state) => state.perils);

const selectPerilsSearch = createSelector(selectPerilsState, (state) => state.search);

export const selectPerilsLoading = createSelector(selectPerilsState, (state) => state.isLoading);

export const selectPerilsSaving = createSelector(selectPerilsState, (state) => state.isSaving);

export const selectUpdatingPerilId = createSelector(
  selectPerilsState,
  (state) => state.updatingPerilId,
);

export const selectPerilsError = createSelector(selectPerilsState, (state) => state.error);

export const selectFilteredPerils = createSelector(
  selectPerils,
  selectPerilsSearch,
  (perils, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return perils;

    return perils.filter(
      (peril) =>
        peril.perilCode.toLowerCase().includes(value) ||
        peril.perilName.toLowerCase().includes(value) ||
        peril.description.toLowerCase().includes(value),
    );
  },
);
