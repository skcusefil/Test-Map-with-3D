import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import * as THREE from 'three';
import { AxesHelper, Vector2, Vector4 } from 'three';
import { Rhino3dmLoader } from 'three/examples/jsm/loaders/3DMLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-mapbox-three',
  templateUrl: './mapbox-three.component.html',
  styleUrls: ['./mapbox-three.component.css']
})
export class MapboxThreeComponent implements OnInit {

  address?: string;
  map!: mapboxgl.Map;
  style = 'mapbox://styles/jsawadpru/ckyvd4ny4002o14t8yir58n46';
  lat = 13.0569951;
  lng = 80.20929129999999;
  message = 'Hello World!';

  object3d_url = 'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf'
  monkey_url = 'assets/gltf/Monkey1/monkey1.gltf'

  camera: any
  scene: any
  renderer: any
  raycaster: any
  pickableObjects: THREE.Object3D[] = []
  modelTransform: any
  originalMaterials: { [id: string]: THREE.Material | THREE.Material[] } = {}
  intersectedObject: THREE.Object3D | null | undefined
  mouse?: Vector4

  constructor() { }

  ngOnInit(): void {

    mapboxgl!.accessToken = 'pk.eyJ1IjoianNhd2FkcHJ1IiwiYSI6ImNreXZjZjIxcjBmMTIybnQ0ejd4OHA0amgifQ.ZoZ2-PDlqT2TRftb1CBd-Q';
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/jsawadpru/ckyvd4ny4002o14t8yir58n46',
      zoom: 18,
      center: [148.9819, -35.3981],
      pitch: 60,
      antialias: true // create the gl context with MSAA antialiasing, so custom layers are antialiased
    });

    const modelOrigin = { lng: 148.9819, lat: -35.39847 };
    const modelAltitude = 0;
    const modelRotate = [Math.PI / 2, 0, 0];

    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      modelOrigin,
      modelAltitude
    );

    this.modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      /* Since the 3D model is in real world meters, a scale transform needs to be
      * applied since the CustomLayerInterface expects units in MercatorCoordinates.
      */
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };
    this.map.on('load', this.onLoad.bind(this))
    this.map.on('mousemove', (event) => {
      if(this.mouse){
        this.mouse.x = ( event.point.x / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.point.y / window.innerHeight ) * 2 + 1;
        this.map.triggerRepaint();
      }
    })

  }

  onmouseMove(event: MouseEvent){
    
  }

  onLoad() {

    const customLayer = {
      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',
      onAdd: (map: mapboxgl.Map, gl: any) => {
        //this.load3d(map, gl)
        this.load3d(map, gl)
      },
      render: (gl: any, matrix: number[] | ArrayLike<number>) => {
        this.create_render(gl, matrix)
      }
    };

    //@ts-ignore
    this.map.addLayer(customLayer, 'waterway-label')
  
  }

  add_cubes(map: mapboxgl.Map, gl: any) {
    this.camera = new THREE.PerspectiveCamera();
    this.scene = new THREE.Scene();

    // var cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(300, 300, 300),
    //   new THREE.MeshNormalMaterial()
    // );
    // this.scene.add(cube)
    // let cube1 = cube.clone();
    // cube1.material = new THREE.MeshNormalMaterial();
    // cube1.translateX(1000);
    // this.scene.add(cube1)

    // let cube2 = cube.clone();
    // cube2.material = new THREE.MeshNormalMaterial();
    // cube2.translateZ(1000);
    // this.scene.add(cube2)


    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/');
    loader.load('assets/models/Rhino_Logo.3dm', (object) => {

      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          this.pickableObjects.push(child)
          this.originalMaterials[m.name] = (m as THREE.Mesh).material
        }
      })
      this.scene.add(object)
    });


    this.map = map;

    // use the Mapbox GL JS map canvas for three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true
    });

    this.renderer.autoClear = false;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector4(-1000, -1000, 1, 1);
  }

  load3d(map: mapboxgl.Map, gl: any) {

    this.camera = new THREE.PerspectiveCamera(75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000);
    this.scene = new THREE.Scene();

    // create two three.js lights to illuminate the model
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    this.scene.add(directionalLight2);

    const loader = new Rhino3dmLoader();
    loader.setLibraryPath('https://cdn.jsdelivr.net/npm/rhino3dm@7.11.1/');
    loader.load('assets/rhino3dm/Rhino_Logo.3dm', (object) => {

      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh
          this.pickableObjects.push(child)
          this.originalMaterials[m.name] = (m as THREE.Mesh).material
        } 
      })

      this.scene.add(object)
      this.scene.add(new AxesHelper(100))
    });

    this.map = map;

    // use the Mapbox GL JS map canvas for three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true
    });

    this.renderer.autoClear = false;
    //this.renderer.domElement.addEventListener('mousemove', this.onClick.bind(this), false);

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector4(-1000, -1000, 1, 1);
  }

  create_render(gl: any, matrix: number[] | ArrayLike<number>) {
    var m = new THREE.Matrix4().fromArray(matrix);
    var l = new THREE.Matrix4()
      .makeTranslation(
        this.modelTransform.translateX,
        this.modelTransform.translateY,
        this.modelTransform.translateZ
      )
      .scale(
        new THREE.Vector3(
          this.modelTransform.scale,
          -this.modelTransform.scale,
          this.modelTransform.scale
        )
      );

    this.camera.projectionMatrix = m.clone().multiply(l);
    this.camera.matrixWorldInverse = new THREE.Matrix4();
    this.renderer.resetState();
    const freeCamera = this.map.getFreeCameraOptions();

    if (freeCamera.position) {
      let cameraPosition = new THREE.Vector4(freeCamera.position.x, freeCamera.position.y, freeCamera.position.z, 1);
      cameraPosition.applyMatrix4(l.invert());

      if (this.mouse) {
        let direction = this.mouse.clone().applyMatrix4(this.camera.projectionMatrix.clone().invert());
        direction.divideScalar(direction.w);
        this.raycaster.set(cameraPosition, direction.sub(cameraPosition).normalize());

        const intersects = this.raycaster.intersectObjects(this.pickableObjects);

        const highlightedMaterial = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: 0x00ff00
        })
        
        if (intersects.length > 0) {
          this.intersectedObject = intersects[0].object
        } else {
          this.intersectedObject = null
        }
    
        this.pickableObjects.forEach((o, i) => {
          var selected_obj = this.pickableObjects[i] as THREE.Mesh
          if (this.intersectedObject && this.intersectedObject.name === o.name) {
            selected_obj.material = highlightedMaterial
          } else {
            selected_obj.material = this.originalMaterials[o.name]
          }
        })
      }
      this.renderer.render(this.scene, this.camera);

    }

  }

  onClick(event: MouseEvent) {
    let intersects: THREE.Intersection[]
    const highlightedMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      color: 0x00ff00
    })
    let mouse = new THREE.Vector2()

    event.preventDefault();

    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    this.raycaster.setFromCamera(mouse, this.camera);

    intersects = this.raycaster.intersectObjects(this.pickableObjects, true)

    if (intersects.length > 0) {
      this.intersectedObject = intersects[0].object
    } else {
      this.intersectedObject = null
    }

    this.pickableObjects.forEach((o, i) => {
      var selected_obj = this.pickableObjects[i] as THREE.Mesh
      if (this.intersectedObject && this.intersectedObject.name === o.name) {
        selected_obj.material = highlightedMaterial
      } else {
        selected_obj.material = this.originalMaterials[o.name]
      }
    })
  }
}
