import { Component } from '@angular/core';
import { AlertController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GoogleCloudVisionServiceProvider } from '../../providers/google-cloud-vision-service/google-cloud-vision-service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  apikey: string;
  items: FirebaseListObservable<any[]>;

  constructor(
    private camera: Camera,
    private vision: GoogleCloudVisionServiceProvider,
    private db: AngularFireDatabase,
    private alert: AlertController) {
    this.items = db.list('items');
    this.apikey = localStorage.getItem('apikey');
    console.dir(this.apikey);
  }

  takePhoto(camera, image) {
    const home = this;
    if (home.apikey) {
      localStorage.setItem('apikey', home.apikey);
    }
    
    const file = camera.files[0];

    let fileReader = new FileReader();

    fileReader.onloadend = (event) => {
      image.src = fileReader.result;
      console.log(fileReader.result);
      this.vision.getLabels(home.apikey, fileReader.result.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")).subscribe((result) => {
     //   this.saveResults(image.src, result.json().responses);
      }, err => {
        this.showAlert(err);
      });
    }

    fileReader.readAsDataURL(file);

  }

  takeCordovaPhoto() {
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 500,
      targetWidth: 500,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.vision.getLabels('', imageData).subscribe((result) => {
        this.saveResults(imageData, result.json().responses);
      }, err => {
        this.showAlert(err);
      });
    }, err => {
      this.showAlert(err);
    });
  }

  saveResults(imageData, results) {
    this.items.push({ imageData: imageData, results: results })
      .then(_ => { })
      .catch(err => { this.showAlert(err) });
  }

  showAlert(message) {
    let alert = this.alert.create({
      title: 'Error',
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }
}