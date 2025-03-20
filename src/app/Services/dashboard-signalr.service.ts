import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class DashboardSignalRService {
  private hubConnection!: signalR.HubConnection;

  viewsCount = signal<number>(0);
  contractorCount = signal<number>(0);
  employeeCount = signal<number>(0);

  constructor() {
  }

  public startConnection() {
    console.log('hulluluuluuuuuululu.....');
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
      this.employeeCount.set(data.employeeCount);
      this.contractorCount.set(data.contractorCount);
      this.viewsCount.set(data.visitorCount);
    });
  }
}
