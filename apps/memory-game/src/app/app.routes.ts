import type { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./game-board/game-board').then((m) => m.GameBoard),
  },
];
