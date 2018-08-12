import $ from 'jquery';
import 'cropper';

class cropper {
  constructor() {
    this.$image = $('#inputImage');
    this.minAspectRatio = 0.5;
    this.maxAspectRatio = 1.5;
    this.inputImage = $('#inputImage');
    this.URL = window.URL || window.webkitURL;
    this.fileurl = '';
    this._init();
  }
  _init() {
    if (this.$image.length === 0) {
      return;
    }
    if (this.URL) {
      this.inputImage.change(() => {
        const files = this.files;
        let file;
        if (!this.$image.data('cropper')) {
          return;
        }
        if (files && files.length) {
          file = files[0];
          if (/^image\/\w+$/.test(file.type)) {
            const blobURL = this.URL.createObjectURL(file);
            this.$image.one('built.cropper', () => {
              this.URL.revokeObjectURL(blobURL);
            }).cropper('reset').cropper('replace', blobURL);
            this.fileurl = files[0];
          }
          //  else {
          //   XUI.hint({
          //     content: '请选择一个图片文件',
          //     color: 'red'
          //   });
          // }
        }
        $('#my-layer-js').layer({
          remote: false,
          bodyScrollBar: false,
          bg2close: true,
          drag: false,
          shown: () => {
            const dialog = $(this).find('.layer-dialog');
            dialog.css('left', ($(window).width() - dialog.outerWidth()) / 2)
              .css('top', ($(window).height() - dialog.outerHeight()) / 2);
          },
        });
      });
    }
    this.$image.cropper({
      aspectRatio: 1,
      viewModel: true,
      // preview: '.img-preview',
      built: () => {
        const containerData = this.$image.cropper('getContainerData');
        const cropBoxData = this.$image.cropper('getCropBoxData');
        const aspectRatio = cropBoxData.width / cropBoxData.height;
        let newCropBoxWidth;
        if (aspectRatio < this.minAspectRatio || aspectRatio > this.maxAspectRatio) {
          newCropBoxWidth = cropBoxData.height * ((this.minAspectRatio + this.maxAspectRatio) / 2);
          this.$image.cropper('setCropBoxData', {
            left: (containerData.width - newCropBoxWidth) / 2,
            width: newCropBoxWidth,
          });
        }
      },
      cropmove: () => {
        const cropBoxData = this.$image.cropper('getCropBoxData');
        const aspectRatio = cropBoxData.width / cropBoxData.height;
        if (aspectRatio < this.minAspectRatio) {
          this.$image.cropper('setCropBoxData', {
            width: cropBoxData.height * this.minAspectRatio,
          });
        } else if (aspectRatio > this.maxAspectRatio) {
          this.$image.cropper('setCropBoxData', {
            width: cropBoxData.height * this.maxAspectRatio,
          });
        }
      },
    });
  }
  getImgData() {
    return this.$image.cropper('getData');
  }
}
export default cropper;
