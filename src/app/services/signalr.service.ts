import { Injectable, OnInit } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
    providedIn: 'root'
})
export class SignalRService implements OnInit {
    private hubConnection!: HubConnection;
    private widgetHubConnection!: HubConnection;

    public data!: { labels: string[], datasets: { label: string, backgroundColor: string, data: number[] }[] };
    public widgetData!: { humidity: number, pressure: number, aqi: number, lightintensity: number };

    constructor() {
        this.data = { labels: [], datasets: [] }; // Initialize properly
        this.widgetData = { humidity: 0, pressure: 0, aqi: 0, lightintensity: 0 };
    }

    ngOnInit(): void {
        this.startConnection(); // Ensure connection starts automatically when the service is initialized
    }

    public startConnection() {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/charthub') // Update with your backend URL
            .withAutomaticReconnect()
            .build();

        this.hubConnection
            .start()
            .then(() => console.log('SignalR Connected'))
            .catch(err => console.log('Error while connecting to SignalR: ', err));

        this.hubConnection.on('TransferChartData', (chartData) => {
            console.log('Received chart data:', chartData);
            this.data = chartData; // ✅ Assign properly formatted data
        });

        // WidgetHub connection
        this.widgetHubConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/widgethub') // Update with your backend URL
            .withAutomaticReconnect()  // Reconnect automatically on connection loss
            .build();

        // Start the connection for WidgetHub
        this.widgetHubConnection
            .start()
            .then(() => console.log('WidgetHub SignalR Connected'))
            .catch(err => console.log('Error while connecting to WidgetHub: ', err));

        // Handle incoming widget data from backend
        this.widgetHubConnection.on('TransferWidgetData', (widgetData) => {
            console.log('Received widget data:', widgetData);
            this.widgetData = widgetData;
        });

        // Optional: Reconnect logic if connection is lost
        this.hubConnection.onclose(() => {
            console.log('ChartHub connection closed. Attempting to reconnect...');
            this.startConnection();
        });

        this.widgetHubConnection.onclose(() => {
            console.log('WidgetHub connection closed. Attempting to reconnect...');
            this.startConnection();
        });
    }
}
