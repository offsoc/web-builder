import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import type { IWidgetPicker } from '@core/interface/IBuilder';
import type { ICoreConfig } from '@core/interface/IAppConfig';
import { BuilderState } from '@core/state/BuilderState';
import { CORE_CONFIG, WIDGETS } from '@core/token/token-providers';
import { Observable, Subject } from 'rxjs';
import { createPopper } from '@popperjs/core';
import { LocalStorageService } from 'ngx-webstorage';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-widget-picker',
  templateUrl: './widget-picker.component.html',
  styleUrls: ['./widget-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPickerComponent implements OnInit, AfterViewInit {
  @Input() content: IWidgetPicker;
  @ViewChild('popup', { static: false }) popup: ElementRef;
  public widget$: Subject<any> = new Subject();
  help: any;
  popper: any;

  public bcData: any;
  builder = inject(BuilderState);
  dialog = inject(MatDialog);
  storage = inject(LocalStorageService);

  constructor(
    @Inject(WIDGETS) public widgets: any[],
    @Inject(CORE_CONFIG) public coreConfig: ICoreConfig,
  ) {}

  ngOnInit(): void {
    this.help = this.coreConfig?.builder?.widgetPicker?.help;
    this.bcData = this.storage.retrieve('bc');
  }

  ngAfterViewInit(): void {}

  onPasteData(): void {
    this.onSelect(this.bcData);
    this.storage.clear(this.builder.COPYKEY);
  }

  onSelect(widget: any): void {
    const { addType, path, content } = this.content;

    // add widget from layout builder toolbar
    if (addType === 'widget') {
      this.builder.updatePageContentByPath(path, widget, 'add');
      this.dialog.closeAll();
      return;
    }

    if (addType === 'layout') {
      this.builder.updatePageContentByPath(
        path,
        this.copyLayoutLastChild(content.elements, widget),
        'add',
      );
      this.dialog.closeAll();
      return;
    }

    // add widget from loop element of layout builder top level
    const lists = [...content.elements];
    lists.splice(lists.length, 0, widget);
    this.builder.updatePageContentByPath(`${path}.elements`, lists);
    this.dialog.closeAll();
  }

  onLeave(): void {
    this.widget$.next(false);
    this.popper.destroy();
  }
  copyLayoutLastChild(elements: any[], widget: any): any {
    const last = Object.assign({}, elements[elements.length - 1]);
    last.elements = [widget];
    return last;
  }

  onHover(widget: any, ele: any): void {
    if (this.popup?.nativeElement) {
      this.widget$.next(widget);
      this.popper = createPopper(ele, this.popup.nativeElement, {
        placement: 'top',
        strategy: 'fixed',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 30],
            },
          },
        ],
      });
    }
  }
}
