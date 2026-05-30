import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameBoard {}
