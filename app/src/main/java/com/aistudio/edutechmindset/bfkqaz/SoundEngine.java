package com.aistudio.edutechmindset.bfkqaz;

import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;

public class SoundEngine {
    private final EduTechPrefs prefs;

    public SoundEngine(EduTechPrefs prefs) {
        this.prefs = prefs;
    }

    public boolean isMuted() {
        return prefs != null && prefs.isSoundMuted();
    }

    public void setMuted(boolean muted) {
        if (prefs != null) {
            prefs.setSoundMuted(muted);
        }
    }

    public void playClick() {
        playToneSequence(new int[]{880}, new int[]{35}, 0.16f);
    }

    public void playSuccess() {
        playToneSequence(new int[]{523, 659, 784, 1046}, new int[]{70, 70, 80, 140}, 0.22f);
    }

    public void playIntroChime() {
        playToneSequence(new int[]{440, 554, 659, 880}, new int[]{90, 90, 110, 180}, 0.22f);
    }

    public void playTimerFinish() {
        playToneSequence(new int[]{784, 988, 1175, 1568}, new int[]{110, 110, 120, 220}, 0.28f);
    }

    public void playToneSequence(final int[] freqs, final int[] durationsMs, final float volume) {
        if (isMuted() || freqs == null || durationsMs == null || freqs.length == 0) return;
        new Thread(() -> {
            AudioTrack track = null;
            try {
                final int sampleRate = 22050;
                int totalMs = 0;
                for (int d : durationsMs) totalMs += d;
                int totalSamples = Math.max(1, (sampleRate * totalMs) / 1000);
                short[] buffer = new short[totalSamples];
                int cursor = 0;
                for (int i = 0; i < freqs.length && i < durationsMs.length; i++) {
                    int n = (sampleRate * durationsMs[i]) / 1000;
                    int f = freqs[i];
                    for (int s = 0; s < n && cursor < totalSamples; s++, cursor++) {
                        double env = Math.exp(-3.0 * s / Math.max(1, n));
                        double val = Math.sin(2.0 * Math.PI * f * s / sampleRate) * volume * env;
                        buffer[cursor] = (short) (val * Short.MAX_VALUE);
                    }
                }
                track = new AudioTrack.Builder()
                        .setAudioAttributes(new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build())
                        .setAudioFormat(new AudioFormat.Builder()
                                .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                                .setSampleRate(sampleRate)
                                .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                                .build())
                        .setBufferSizeInBytes(buffer.length * 2)
                        .setTransferMode(AudioTrack.MODE_STATIC)
                        .build();
                track.write(buffer, 0, buffer.length);
                track.play();
                Thread.sleep(totalMs + 60L);
            } catch (Exception ignored) {
            } finally {
                if (track != null) {
                    try {
                        track.release();
                    } catch (Exception ignored) {
                    }
                }
            }
        }).start();
    }

    public void playIntro() { }
}
