import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TriggerDefinitionsState } from './trigger-definitions.state';

const selectTriggerDefinitionsState = createFeatureSelector<TriggerDefinitionsState>('triggerDefinitions');

export const selectTriggerDefinitions = createSelector(
  selectTriggerDefinitionsState,
  state => state.definitions,
);

export const selectSelectedTriggerDefinition = createSelector(
  selectTriggerDefinitionsState,
  state => state.selectedDefinition,
);

export const selectTriggerDefinitionsSearch = createSelector(
  selectTriggerDefinitionsState,
  state => state.search,
);

export const selectTriggerDefinitionsLoading = createSelector(
  selectTriggerDefinitionsState,
  state => state.isLoading,
);

export const selectTriggerDefinitionsSaving = createSelector(
  selectTriggerDefinitionsState,
  state => state.isSaving,
);

export const selectTriggerDefinitionsEvaluating = createSelector(
  selectTriggerDefinitionsState,
  state => state.isEvaluating,
);

export const selectUpdatingTriggerDefinitionId = createSelector(
  selectTriggerDefinitionsState,
  state => state.updatingDefinitionId,
);

export const selectTriggerDefinitionsError = createSelector(
  selectTriggerDefinitionsState,
  state => state.error,
);

export const selectFilteredTriggerDefinitions = createSelector(
  selectTriggerDefinitions,
  selectTriggerDefinitionsSearch,
  (definitions, search) => {
    const value = search.trim().toLowerCase();

    if (!value) return definitions;

    return definitions.filter(def =>
      def.definitionCode.toLowerCase().includes(value) ||
      def.definitionName.toLowerCase().includes(value) ||
      def.description.toLowerCase().includes(value) ||
      def.perilCode?.toLowerCase().includes(value) === true ||
      def.perilName?.toLowerCase().includes(value) === true ||
      def.zoneCode?.toLowerCase().includes(value) === true ||
      def.zoneName?.toLowerCase().includes(value) === true ||
      def.measurementType.toLowerCase().includes(value) ||
      def.status.toLowerCase().includes(value),
    );
  },
);

export const selectActiveTriggerDefinitionCount = createSelector(
  selectTriggerDefinitions,
  definitions => definitions.filter(d => d.status === 'ACTIVE').length,
);

export const selectDraftTriggerDefinitionCount = createSelector(
  selectTriggerDefinitions,
  definitions => definitions.filter(d => d.status === 'DRAFT').length,
);
