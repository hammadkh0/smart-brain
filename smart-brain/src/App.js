import './App.css';
import React,{Component} from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Particles from 'react-particles-js'
import Clarifai from 'clarifai'

const app = new Clarifai.App({
  apiKey : 'ec34c6cd393e4868b2365cee6501ec1e'
});

const particlesOption = {
  particles: {
    number:{
      vlaue:50,
      density:{
        enable:true,
        value_area: 800
      }
    }
  }
}

class App extends Component  {
  constructor(){
    super()
    this.state = {
      input: '',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn: false,

      user:{
        id:'',
        name:'',
        email:'',
        password:'',
        entries:0,
        joined:''
    },
    }
  }

  loadUser = (data) => {
    this.setState({user:{
        id : data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
      }
    }) 
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width)
    const height= Number(image.height)

    return {
        leftCol : clarifaiFace.left_col * width,
        rightCol: width - (clarifaiFace.right_col * width),
        topRow : clarifaiFace.top_row * height,
        bottomRow : height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
    this.setState({
      box:box
    })
    console.log(box)
  }
  
  onInputChange = (event) =>{
    this.setState({input:event.target.value})
  } 

  onSubmit = () => {

    this.setState({imageUrl:this.state.input})

    app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input).then(
      response =>{
        if(response){
          fetch('http://localhost:3000/image',{
            method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              id:this.state.user.id
            })
          })
          .then(response=> response.json())
          .then(count => {
            this.setState(Object.assign(
              this.state.user,{entries:count}
            ))
           })
          
        }
        this.displayFaceBox(
          this.calculateFaceLocation(response)
        )
      })
      .catch (err => console.log(err))
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState({isSignedIn: false})
    }
    else if (route === 'home'){
      this.setState({isSignedIn: true })
    }
    this.setState({
      route : route
    })
  }


  render(){
    return (
      <div className="App">

        <Particles className='particles'
          params={
            particlesOption
          }
        />

        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'home' ?
           <div>
           <Logo />
           <Rank name={this.state.user.name} entries={this.state.user.entries}/>
           <ImageLinkForm onInputChange={this.onInputChange} onSubmit={this.onSubmit}/>
           <FaceRecognition imageUrl={this.state.imageUrl} box={this.state.box}/>
         </div>:(
           this.state.route === 'signin' ?
           <Signin  loadUser={this.loadUser }  onRouteChange={this.onRouteChange}/> :
           <Register loadUser={this.loadUser } onRouteChange={this.onRouteChange}/> 
          )
         }
         
      </div>
    );
  }
}

export default App;
