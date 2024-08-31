import React, { Component } from "react";
import ParticlesBg from "particles-bg";
import Navigation from "./components/navigation/navigation";
import Logo from "./components/logo/logo";
import Register from "./components/Register/Register";
import ImageLinkform from "./components/ImageLinkform/ImageLinkform";
import Signin from "./components/Signin/Signin"
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Rank from "./components/rank/rank";
import "./App.css";

const PAT = '096813c7f4874a5d919d91c3acd560e6';

const USER_ID = 'clarifai';
const APP_ID = 'main';

const MODEL_ID = 'celebrity-face-detection';
const MODEL_VERSION_ID = '2ba4d0b0e53043f38dbbed49e03917b6';
const IMAGE_URL = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: 'Signin',
  isSignin: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }


  loadUser = (data) => {
    console.log(data)
    this.setState({
      user: {
        name: data.name,
        email: data.email,
        id: data.id,
        entries: data.entries,
        joined: data.joined,
      }
    })
  }
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    console.log(data.outputs[0].data.regions[0].region_info.bounding_box)
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const leftCol = clarifaiFace.left_col * width;
    const topRow = clarifaiFace.top_row * height;
    const rightCol = width - (clarifaiFace.right_col * width);
    const bottomRow = height - (clarifaiFace.bottom_row * height)
    return {
      leftCol: leftCol,
      topRow: topRow,
      rightCol: rightCol,
      bottomRow: bottomRow
    }
  }


  faceBox = (box) => {
    console.log(box);
    this.setState({ box });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonChange = () => {
    this.setState({ imageUrl: this.state.input });
    const raw = JSON.stringify({
      "user_app_id": {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      "inputs": [
        {
          "data": {
            "image": {
              "url": this.state.input

            }
          }
        }
      ]
    });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
      },
      body: raw
    };
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://facerecognizebrain-bckend-1.onrender.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          }).then(response => response.json())
            .then(count => {
              // console.log("1", this.state.user)
              const userObject = { ...this.state.user, entries: count }

              // this.setState(userObject)
              this.setState(Object.assign(this.state.user, { entries: count }))
              // console.log("2", this.state.user)
            })
        }
        this.faceBox(this.calculateFaceLocation(response))
      })
      .catch(error => console.log('error', error))


  };

  onRouteChange = (route) => {
    if (route === 'Signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({ isSignin: 'true' })
    }
    this.setState({ route: route });
  }

  render() {
    // window.alert(JSON.stringify(this.state))

    return (
      <div className="App">
        <ParticlesBg type="cobweb" bg={true} />
        <Navigation isSignin={this.state.isSignin} onRouteChange={this.onRouteChange} />
        {this.state.route === 'home'
          ? <div>
            <Logo />
            <Rank name={this.state.user.name}
              entries={this.state.user.entries} />
            <ImageLinkform
              onInputChange={this.onInputChange}
              onButtonChange={this.onButtonChange}
            />
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl} />
          </div>
          : (this.state.route === 'Signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          )

        }
      </div>

    );
  }
}

export default App;