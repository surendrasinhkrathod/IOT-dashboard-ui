import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private chartHubConnection!: HubConnection;
    private widgetHubConnection!: HubConnection;

    public data!: { labels: string[], datasets: { label: string, backgroundColor: string, data: number[] }[] };
    public widgetData!: { humidity: number, pressure: number, aqi: number, lightintensity: number };

    constructor() {
        this.data = { labels: [], datasets: [] };
        this.widgetData = { humidity: 0, pressure: 0, aqi: 0, lightintensity: 0 };

        this.startChartConnection();
        this.startWidgetConnection();
    }

    private startChartConnection() {
        this.chartHubConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/charthub') // Ensure this URL is correct
            .withAutomaticReconnect()
            .build();

        this.chartHubConnection.start()
            .then(() => console.log('✅ ChartHub Connected'))
            .catch(err => console.log('❌ Error connecting to ChartHub:', err));

        this.chartHubConnection.on('TransferChartData', (chartData) => {
            console.log('📊 Received Chart Data:', chartData);
            this.data = chartData;
        });

        this.chartHubConnection.onclose(() => {
            console.log('⚠️ ChartHub connection lost. Reconnecting...');
            this.startChartConnection();
        });
    }

    private startWidgetConnection() {
        this.widgetHubConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/widgethub') // Ensure this URL is correct
            .withAutomaticReconnect()
            .build();

        this.widgetHubConnection.start()
            .then(() => console.log('✅ WidgetHub Connected'))
            .catch(err => console.log('❌ Error connecting to WidgetHub:', err));

        this.widgetHubConnection.on('TransferWidgetData', (widgetData) => {
            console.log('📟 Received Widget Data:', widgetData);
            this.widgetData = widgetData;
        });

        this.widgetHubConnection.onclose(() => {
            console.log('⚠️ WidgetHub connection lost. Reconnecting...');
            this.startWidgetConnection();
        });
    }
}
