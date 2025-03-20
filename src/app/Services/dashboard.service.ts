import { computed, effect, Injectable, signal } from '@angular/core';
import { Widget } from '../models/dashboard';
import { SubscribersComponent } from '../Dashboard/widgets/subscribers.component';
import { ViewsComponent } from '../Dashboard/widgets/views.component';
import { WatchTimeComponent } from '../Dashboard/widgets/watch-time.component';
import { RevenueComponent } from '../Dashboard/widgets/revenue.component';
import { AnalyticsComponent } from '../Dashboard/widgets/analytics.component';

@Injectable()

export class DashboardService {

  widgets = signal<Widget[]>([
    {
      label: "Employees",
      content: SubscribersComponent,
      backgroundColor: 'black',
      color: 'yellow'
    },
    {
      label: "Visitors",
      content: ViewsComponent,
      backgroundColor: 'black',
      color: 'yellow'
    },
    {
      label: "watch-time",
      content: WatchTimeComponent,
      backgroundColor: 'black',
      color: 'yellow'
    },
    {
      label: "Contractors",
      content: RevenueComponent,
      backgroundColor: 'black',
      color: 'yellow'
    },
    {
      label: "analytics",
      content: AnalyticsComponent,
      rows: 2,
      columns: 2
    },
  ]);

  addedWidgets = signal<Widget[]>([]);

  widgetsToAdd = computed(() => {
    const addedIds = this.addedWidgets().map(w => w.label);
    return this.widgets().filter(w => !addedIds.includes(w.label));
  });

  addWidget(w: Widget) {
    this.addedWidgets.set([...this.addedWidgets(), {...w}]); // {...w } ensures immutability
  }

  updateWidget(label: string, widget: Partial<Widget>){
    const index = this.addedWidgets().findIndex(w => w.label === label);
    if(index !== -1){ //making changes immutably
      const newWidgets = [...this.addedWidgets()];
      //override the previous values with the old values
      newWidgets[index] = { ...newWidgets[index], ...widget };
      this.addedWidgets.set(newWidgets);
    }
  }

  moveWidgetToRight(label: string){
    //find the index of the widget
    const index = this.addedWidgets().findIndex(w => w.label === label);
    //if widget is in the last index of arr , just return the func
    if ( index === this.addedWidgets().length -1){
      return;
    }
    //else carry on with swapping procedure
    const newWidgtes = [...this.addedWidgets()];
    [newWidgtes[index], newWidgtes[index + 1]] = [{ ...newWidgtes[index + 1]}, { ...newWidgtes[index]}];
    //update signal to new widgets
    this.addedWidgets.set(newWidgtes);
  }

  moveWidgetToLeft(label: string){
    //find the index of the widget
    const index = this.addedWidgets().findIndex(w => w.label === label);
    //if widget is in the last index of arr , just return the func
    if ( index === 0){
      return;
    }
    //else carry on with swapping procedure
    const newWidgtes = [...this.addedWidgets()];
    [newWidgtes[index], newWidgtes[index - 1]] = [{ ...newWidgtes[index - 1]}, { ...newWidgtes[index]}];
    //update signal to new widgets
    this.addedWidgets.set(newWidgtes);
  }

  removeWidget(label: string){
    //filter the array to remove for now
    this.addedWidgets.set(this.addedWidgets().filter(w => w.label !== label));
  }

  fetchWidgets(){
    const widgetsAsString = localStorage.getItem('dashboardWidgets');
    if(widgetsAsString){
      const widgets = JSON.parse(widgetsAsString) as Widget[];
      widgets.forEach(widget => {
        const content = this.widgets().find(w => w.label === widget.label)?.content;
        if(content){
          widget.content = content;
        }
      })
      this.addedWidgets.set(widgets);
    }
  }

  constructor(){
    this.fetchWidgets();
  }

  updateWidgetPosition( sourceWidgetId: string, targetWidgetId: string){
    const sourceIndex = this.addedWidgets().findIndex(
      (w) => w.label === sourceWidgetId
    );

    if (sourceIndex === -1){
      return;
    }
    const newWidgets = [...this.addedWidgets()]; //clone to avoid direct mutation
    const sourceWidget = newWidgets.splice(sourceIndex, 1)[0];

    const targetIndex = newWidgets.findIndex((w) => w.label === targetWidgetId);
    if(targetIndex === -1){
      return;
    }

    //in order to have the widget at the 0th index also change position
    const insertAt = targetIndex === sourceIndex ? targetIndex + 1 : targetIndex;

    //simply inset source widget to new widget 
    //0 as we arent removing anything instead we are inserting the widget on the same positon
    newWidgets.splice(insertAt, 0, sourceWidget);
    this.addedWidgets.set(newWidgets);
  }

  saveWidgets = effect(() => {
    const widgetsWithoutContent = this.addedWidgets().map(w => ({ ...w }));
    widgetsWithoutContent.forEach(w => {
      delete w.content;
    })

    localStorage.setItem('dashboardWidgets', JSON.stringify(widgetsWithoutContent));
  })
}
