import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Inject,
  inject,
} from '@angular/core';
import { Event, NavigationStart, Router } from '@angular/router';
import type { IBranding } from '@core/interface/branding/IBranding';
import { ScreenState } from '@core/state/screen/ScreenState';
import { BRANDING, CORE_CONFIG } from '@core/token/token-providers';
import type { ICoreConfig } from '@core/interface/IAppConfig';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  host: { ngSkipHydration: 'true' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  @Input() isDrawer: boolean;
  show = true;

  screen = inject(ScreenState);
  router = inject(Router);
  cd = inject(ChangeDetectorRef);
  constructor(
    @Inject(CORE_CONFIG) public coreConfig: ICoreConfig,
    @Inject(BRANDING) public branding$: Observable<IBranding>,
  ) {
    this.router.events.subscribe((event: Event) => {
      if (this.isDrawer && event instanceof NavigationStart) {
        this.screen.toggleDrawer();
      }
    });
  }

  ngOnInit(): void {
    this.screen.mqAlias$().subscribe((mq: string[]) => {
      this.show = mq.includes('md') || mq.includes('lg') || mq.includes('xl');
      this.cd.detectChanges();
    });
  }

  onToggle(): void {
    this.screen.toggleDrawer();
    this.cd.detectChanges();
  }

  trackByFn(index: number, item: any): number {
    return index;
  }
}
