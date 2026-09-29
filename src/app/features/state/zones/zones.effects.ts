import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap } from 'rxjs/operators';
import { ZoneService } from '../../services/zone.service';
import { httpErrorMessage } from '../products/products.effects';
import {
  archiveZone,
  archiveZoneFailure,
  archiveZoneSuccess,
  createZone,
  createZoneFailure,
  createZoneSuccess,
  loadZone,
  loadZoneFailure,
  loadZoneSuccess,
  loadZones,
  loadZonesFailure,
  loadZonesSuccess,
  updateZone,
  updateZoneFailure,
  updateZoneAlert,
  updateZoneExposureCap,
  updateZoneStatus,
  updateZoneStatusFailure,
  updateZoneStatusSuccess,
  updateZoneSuccess,
} from './zones.actions';

@Injectable()
export class ZonesEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly zoneService: ZoneService,
  ) {}

  loadZones$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadZones),
      switchMap(({ state }) =>
        this.zoneService.getAllZones(state).pipe(
          map(zones => loadZonesSuccess({ zones })),
          catchError(error =>
            of(loadZonesFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  loadZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadZone),
      switchMap(({ zoneId }) =>
        this.zoneService.getZone(zoneId).pipe(
          map(zone => loadZoneSuccess({ zone })),
          catchError(error =>
            of(loadZoneFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  createZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createZone),
      exhaustMap(({ request }) =>
        this.zoneService.createZone(request).pipe(
          map(zone => createZoneSuccess({ zone })),
          catchError(error =>
            of(createZoneFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updateZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateZone),
      exhaustMap(({ zoneId, request }) =>
        this.zoneService.updateZone(zoneId, request).pipe(
          map(zone => updateZoneSuccess({ zone })),
          catchError(error =>
            of(updateZoneFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updateZoneStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateZoneStatus),
      exhaustMap(({ zoneId, status }) =>
        this.zoneService.updateZoneStatus(zoneId, status).pipe(
          map(zone => updateZoneStatusSuccess({ zone })),
          catchError(error =>
            of(updateZoneStatusFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  // Alert and cap changes return the updated zone, so they reuse the status-update result actions.
  updateZoneAlert$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateZoneAlert),
      exhaustMap(({ zoneId, active, message }) =>
        this.zoneService.updateZoneAlert(zoneId, active, message).pipe(
          map(zone => updateZoneStatusSuccess({ zone })),
          catchError(error =>
            of(updateZoneStatusFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  updateZoneExposureCap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateZoneExposureCap),
      exhaustMap(({ zoneId, maxExposure }) =>
        this.zoneService.updateZoneExposureCap(zoneId, maxExposure).pipe(
          map(zone => updateZoneStatusSuccess({ zone })),
          catchError(error =>
            of(updateZoneStatusFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );

  archiveZone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(archiveZone),
      exhaustMap(({ zoneId }) =>
        this.zoneService.archiveZone(zoneId).pipe(
          map(() => archiveZoneSuccess({ zoneId })),
          catchError(error =>
            of(archiveZoneFailure({ error: httpErrorMessage(error) })),
          ),
        ),
      ),
    ),
  );
}