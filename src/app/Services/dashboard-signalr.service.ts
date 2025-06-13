import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class DashboardSignalRService {
  private hubConnection!: signalR.HubConnection;

  //store the json in a single object 
  dashboardData = signal({
    employees: { total: 0, male: 0, female: 0, blacklisted: 0, active: 0 },
    contractors: { total: 0, male: 0, female: 0, blacklisted: 0, active: 0 },
    visitors: { total: 0, male: 0, female: 0, blacklisted: 0 },
    shiftHeadCounts: [],
  });

  constructor() {
  }

  public startConnection() {
    console.log('areeee ho gaya start');
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${'https://localhost:7155/OryggiXpertAPI/XpertHubApi'}`,{
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.listenForUpdates();
        console.log('Connected to SignalR')
      })
      .catch((err) => console.error('SignalR Connection Error:', err));

  }

  private listenForUpdates() {
    if (!this.hubConnection) {
      console.warn('SignalR connection is not initialized.');
      return;
    }

    console.log('listenToEvents')

    this.hubConnection.on('dashSigR', (data: any) => {
      console.log(data);
      this.dashboardData.set(data);
    });
  }
}
