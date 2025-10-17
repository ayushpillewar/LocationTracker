// android/app/src/main/java/com/yourapp/LocationTrackingService.java
package com.yourapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.telephony.SmsManager;

public class LocationTrackingService extends Service implements LocationListener {
    private static final String CHANNEL_ID = "LocationTrackingChannel";
    private static final int NOTIFICATION_ID = 1;
    
    private LocationManager locationManager;
    private String phoneNumber;
    private long intervalMillis;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        phoneNumber = intent.getStringExtra("phoneNumber");
        intervalMillis = intent.getLongExtra("interval", 300000); // Default 5 minutes

        startForeground(NOTIFICATION_ID, createNotification());
        startLocationUpdates();

        return START_STICKY;
    }

    private void startLocationUpdates() {
        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        
        try {
            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                intervalMillis,
                0,
                this
            );
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onLocationChanged(Location location) {
        if (location != null && phoneNumber != null) {
            String message = String.format(
                "Location Update\nLat: %.6f\nLon: %.6f\nMap: https://maps.google.com/?q=%.6f,%.6f",
                location.getLatitude(),
                location.getLongitude(),
                location.getLatitude(),
                location.getLongitude()
            );
            
            sendSMS(phoneNumber, message);
        }
    }

    private void sendSMS(String phoneNumber, String message) {
        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Tracking your location");
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracker")
            .setContentText("Tracking active")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}

    @Override
    public void onProviderEnabled(String provider) {}

    @Override
    public void onProviderDisabled(String provider) {}
}