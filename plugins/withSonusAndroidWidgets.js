const fs = require('fs');
const path = require('path');
const { AndroidConfig, withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');

const WIDGETS = [
  {
    className: 'SonusPlayerSmallWidgetProvider',
    label: 'Sonus Player',
    layout: 'sonus_widget_small',
    provider: 'sonus_player_small_widget',
    minWidth: '180dp',
    minHeight: '72dp',
  },
  {
    className: 'SonusPlayerLargeWidgetProvider',
    label: 'Sonus Player Grande',
    layout: 'sonus_widget_large',
    provider: 'sonus_player_large_widget',
    minWidth: '300dp',
    minHeight: '150dp',
  },
];

module.exports = function withSonusAndroidWidgets(config) {
  config = withAndroidManifest(config, (mod) => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    app.receiver = app.receiver ?? [];

    WIDGETS.forEach((widget) => {
      const receiverName = `.${widget.className}`;
      const exists = app.receiver.some((receiver) => receiver.$?.['android:name'] === receiverName);
      if (exists) return;

      app.receiver.push({
        $: {
          'android:name': receiverName,
          'android:exported': 'true',
          'android:label': widget.label,
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': `@xml/${widget.provider}`,
            },
          },
        ],
      });
    });

    return mod;
  });

  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const appPackage = config.android?.package ?? 'com.ricardosb.sonus';
      const projectRoot = mod.modRequest.platformProjectRoot;

      writeWidgetResources(projectRoot);
      writeWidgetProviders(projectRoot, appPackage);

      return mod;
    },
  ]);
};

function writeWidgetResources(projectRoot) {
  const resDir = path.join(projectRoot, 'app', 'src', 'main', 'res');
  const xmlDir = path.join(resDir, 'xml');
  const layoutDir = path.join(resDir, 'layout');
  const drawableDir = path.join(resDir, 'drawable');

  fs.mkdirSync(xmlDir, { recursive: true });
  fs.mkdirSync(layoutDir, { recursive: true });
  fs.mkdirSync(drawableDir, { recursive: true });

  fs.writeFileSync(
    path.join(drawableDir, 'sonus_widget_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
  <solid android:color="#102225" />
  <corners android:radius="18dp" />
  <stroke android:width="1dp" android:color="#254145" />
  <padding android:left="14dp" android:top="12dp" android:right="14dp" android:bottom="12dp" />
</shape>
`,
  );

  WIDGETS.forEach((widget) => {
    fs.writeFileSync(
      path.join(xmlDir, `${widget.provider}.xml`),
      `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
  android:minWidth="${widget.minWidth}"
  android:minHeight="${widget.minHeight}"
  android:targetCellWidth="${widget.className.includes('Small') ? 3 : 5}"
  android:targetCellHeight="${widget.className.includes('Small') ? 1 : 2}"
  android:updatePeriodMillis="1800000"
  android:initialLayout="@layout/${widget.layout}"
  android:resizeMode="horizontal|vertical"
  android:widgetCategory="home_screen" />
`,
    );
  });

  fs.writeFileSync(
    path.join(layoutDir, 'sonus_widget_small.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:id="@+id/sonus_widget_root"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:background="@drawable/sonus_widget_background"
  android:gravity="center_vertical"
  android:orientation="horizontal">

  <TextView
    android:id="@+id/sonus_widget_title"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    android:layout_weight="1"
    android:ellipsize="end"
    android:maxLines="1"
    android:text="Sonus"
    android:textColor="#F8FAFC"
    android:textSize="18sp"
    android:textStyle="bold" />

  <TextView
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:id="@+id/sonus_widget_previous"
    android:padding="8dp"
    android:text="Anterior"
    android:textColor="#A6BFC0"
    android:textStyle="bold" />

  <TextView
    android:id="@+id/sonus_widget_play"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:padding="8dp"
    android:text="Tocar"
    android:textColor="#5EEAD4"
    android:textStyle="bold" />

  <TextView
    android:id="@+id/sonus_widget_next"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:padding="8dp"
    android:text="Proxima"
    android:textColor="#A6BFC0"
    android:textStyle="bold" />
</LinearLayout>
`,
  );

  fs.writeFileSync(
    path.join(layoutDir, 'sonus_widget_large.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
  android:id="@+id/sonus_widget_root"
  android:layout_width="match_parent"
  android:layout_height="match_parent"
  android:background="@drawable/sonus_widget_background"
  android:gravity="center_vertical"
  android:orientation="vertical">

  <TextView
    android:id="@+id/sonus_widget_title"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:ellipsize="end"
    android:maxLines="1"
    android:text="Sonus"
    android:textColor="#F8FAFC"
    android:textSize="22sp"
    android:textStyle="bold" />

  <TextView
    android:id="@+id/sonus_widget_subtitle"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginTop="6dp"
    android:text="Toque para abrir seu player offline"
    android:textColor="#A6BFC0"
    android:textSize="14sp" />

  <TextView
    android:id="@+id/sonus_widget_previous"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="18dp"
    android:text="Anterior"
    android:textColor="#A6BFC0"
    android:textStyle="bold" />

  <TextView
    android:id="@+id/sonus_widget_play"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="8dp"
    android:text="Tocar / Pausar"
    android:textColor="#5EEAD4"
    android:textStyle="bold" />

  <TextView
    android:id="@+id/sonus_widget_next"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginTop="8dp"
    android:text="Proxima"
    android:textColor="#A6BFC0"
    android:textStyle="bold" />
</LinearLayout>
`,
  );
}

function writeWidgetProviders(projectRoot, packageName) {
  const packageDir = path.join(
    projectRoot,
    'app',
    'src',
    'main',
    'java',
    ...packageName.split('.'),
  );
  fs.mkdirSync(packageDir, { recursive: true });

  WIDGETS.forEach((widget) => {
    fs.writeFileSync(
      path.join(packageDir, `${widget.className}.java`),
      `package ${packageName};

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.view.KeyEvent;
import android.widget.RemoteViews;

public class ${widget.className} extends AppWidgetProvider {
  private static final String ACTION_PLAY_PAUSE = "${packageName}.widget.PLAY_PAUSE";
  private static final String ACTION_NEXT = "${packageName}.widget.NEXT";
  private static final String ACTION_PREVIOUS = "${packageName}.widget.PREVIOUS";

  @Override
  public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
    for (int appWidgetId : appWidgetIds) {
      updateAppWidget(context, appWidgetManager, appWidgetId);
    }
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    super.onReceive(context, intent);
    String action = intent.getAction();

    if (ACTION_PLAY_PAUSE.equals(action)) {
      dispatchMediaKey(context, KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE);
    } else if (ACTION_NEXT.equals(action)) {
      dispatchMediaKey(context, KeyEvent.KEYCODE_MEDIA_NEXT);
    } else if (ACTION_PREVIOUS.equals(action)) {
      dispatchMediaKey(context, KeyEvent.KEYCODE_MEDIA_PREVIOUS);
    }
  }

  static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
    RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.${widget.layout});
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());

    if (launchIntent != null) {
      launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
      PendingIntent pendingIntent = PendingIntent.getActivity(
        context,
        appWidgetId,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
      );
      views.setOnClickPendingIntent(R.id.sonus_widget_root, pendingIntent);
    }

    views.setOnClickPendingIntent(
      R.id.sonus_widget_play,
      mediaPendingIntent(context, ACTION_PLAY_PAUSE, appWidgetId + 10)
    );
    views.setOnClickPendingIntent(
      R.id.sonus_widget_next,
      mediaPendingIntent(context, ACTION_NEXT, appWidgetId + 20)
    );
    views.setOnClickPendingIntent(
      R.id.sonus_widget_previous,
      mediaPendingIntent(context, ACTION_PREVIOUS, appWidgetId + 30)
    );

    appWidgetManager.updateAppWidget(appWidgetId, views);
  }

  private static PendingIntent mediaPendingIntent(Context context, String action, int requestCode) {
    Intent intent = new Intent(context, ${widget.className}.class);
    intent.setAction(action);
    return PendingIntent.getBroadcast(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
  }

  private static void dispatchMediaKey(Context context, int keyCode) {
    AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);
    if (audioManager == null) return;

    audioManager.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, keyCode));
    audioManager.dispatchMediaKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, keyCode));
  }
}
`,
    );
  });
}
