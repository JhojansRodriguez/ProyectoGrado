<!-- Componente de grabador de video -->
<template>
  <div 
    :class="[
      'video-recorder',
      {
        'has-error': !!error,
        'has-success': success,
        'is-disabled': disabled,
        'is-readonly': readonly,
        'is-recording': isRecording,
        'has-video': hasVideo
      }
    ]"
  >
    <!-- Área de video -->
    <div class="video-container">
      <!-- Vista previa de la cámara -->
      <video
        v-show="isRecording || isPreviewing"
        ref="previewVideo"
        class="preview-video"
        autoplay
        muted
        playsinline
      ></video>

      <!-- Video grabado -->
