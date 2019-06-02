import {tiny, defs} from './assignment-4-resources.js';
                                                                // Pull these names into this module's scope for convenience:
const { Vec, Mat, Mat4, Color, Light, Shape, Shader, Material, Texture,
         Scene, Canvas_Widget, Code_Widget, Text_Widget } = tiny;
const { Cube, Subdivision_Sphere, Transforms_Sandbox_Base, Torus, Square, Triangle, Capped_Cylinder, Tetrahedron } = defs;

    // Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and assignment-4-resources.js.
    // This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

// (Can define Main_Scene's class here)

const Main_Scene =
class Solar_System extends Scene
{                                             // **Solar_System**:  Your Assingment's Scene.
  constructor()
    {                  // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
      super();
                                                        // At the beginning of our program, load one of each of these shape 
                                                        // definitions onto the GPU.  NOTE:  Only do this ONCE per shape.
                                                        // Don't define blueprints for shapes in display() every frame.

                                                // TODO (#1):  Complete this list with any additional shapes you need.
      this.shapes = { 'cube' : new Cube(),
                   'ball_4' : new Subdivision_Sphere( 4 ),
                     'star' : new Planar_Star(),
                     'torus': new Torus(100,100,[0,10]),
                    'square': new Square(),
                  'triangle': new Triangle(),
                  'cylinder': new Capped_Cylinder(100,100,[0,10]),
                   'ball_6' : new Subdivision_Sphere( 6 ),
              'tetrahedron' : new Tetrahedron( Boolean(false) ) };
              
      
      this.sounds = { blast : new Audio('assets/blast.wav'),
                      drift : new Audio('assets/carDrifting.wav'),
                 accelerate : new Audio('assets/m3_accelerate.aiff')};            

                                                        // TODO (#1d): Modify one sphere shape's existing texture 
                                                        // coordinates in place.  Multiply them all by 5.
      // this.shapes.ball_repeat.arrays.texture_coord.forEach( coord => coord
      
                                                              // *** Shaders ***

                                                              // NOTE: The 2 in each shader argument refers to the max
                                                              // number of lights, which must be known at compile time.
                                                              
                                                              // A simple Phong_Blinn shader without textures:
      const phong_shader      = new defs.Phong_Shader  (2);
                                                              // Adding textures to the previous shader:
      const texture_shader    = new defs.Textured_Phong(2);
                                                              // Same thing, but with a trick to make the textures 
                                                              // seemingly interact with the lights:
      const texture_shader_2  = new defs.Fake_Bump_Map (2);
                                                              // A Simple Gouraud Shader that you will implement:
      const gouraud_shader    = new Gouraud_Shader     (2);
                                                              // Extra credit shaders:
      const black_hole_shader = new Black_Hole_Shader();
      const sun_shader        = new Sun_Shader();
      
                                              // *** Materials: *** wrap a dictionary of "options" for a shader.

                                              // TODO (#2):  Complete this list with any additional materials you need:

      this.materials = { plastic: new Material( phong_shader, 
                                    { ambient: 1, diffusivity: 1, specularity: 0, color: Color.of( 1,.5,1,1 ) } ),
                   plastic_stars: new Material( texture_shader_2,    
                                    { texture: new Texture( "assets/stars.png" ),
                                      ambient: 0, diffusivity: 1, specularity: 0, color: Color.of( .4,.4,.4,1 ) } ),
                           metal: new Material( phong_shader,
                                    { ambient: 0, diffusivity: 1, specularity: 1, color: Color.of( 1,.5,1,1 ) } ),
                     metal_earth: new Material( texture_shader_2,    
                                    { texture: new Texture( "assets/earth.gif" ),
                                      ambient: 0, diffusivity: 1, specularity: 1, color: Color.of( .4,.4,.4,1 ) } ),
                      black_hole: new Material( black_hole_shader ),
                             sun: new Material( sun_shader, { ambient: 1, color: Color.of( 0,0,0,1 ) } ),
                       skybox_zneg : new Material( texture_shader_2,
                                    { texture: new Texture("assets/zneg.jpeg"),
                                      ambient: 0.6, diffusivity: 0, specularity: 0, color: Color.of(.4,.4,.4,1) }),
                       skybox_zpos : new Material( texture_shader_2,
                                    { texture: new Texture("assets/zpos.jpeg"),
                                      ambient: 0.6, diffusivity: 0, specularity: 0, color: Color.of(.4,.4,.4,1) }),
                       skybox_xpos : new Material( texture_shader_2,
                                    { texture: new Texture("assets/xpos.jpeg"),
                                      ambient: 0.6, diffusivity: 0, specularity: 0, color: Color.of(.4,.4,.4,1) }),
                       skybox_xneg : new Material( texture_shader_2,
                                    { texture: new Texture("assets/xneg.jpeg"),
                                      ambient: 0.6, diffusivity: 0, specularity: 0, color: Color.of(.4,.4,.4,1) }),
                       skybox_ypos : new Material( texture_shader_2,
                                    { texture: new Texture("assets/ypos.jpeg"),
                                      ambient: 0.6, diffusivity: 0, specularity: 0, color: Color.of(.4,.4,.4,1) }),
                       skybox_yneg : new Material( texture_shader_2,
                                    { texture: new Texture("assets/yneg.jpeg"),
                                      ambient: 0.6, diffusivity: 0, specularity: 0, color: Color.of(.4,.4,.4,1) }),
                          text_box : new Material( texture_shader_2,
                                    { texture: new Texture("assets/textBox.jpeg"),
                                      ambient: 0.6, diffusivity: 1, specularity: 0.5, color: Color.of(.4,.4,.4,1) })
                             };

                                  // Some setup code that tracks whether the "lights are on" (the stars), and also
                                  // stores 30 random location matrices for drawing stars behind the solar system:
      this.lights_on = false;
      this.star_matrices = [];
      for( let i=0; i<30; i++ )
        this.star_matrices.push( Mat4.rotation( Math.PI/2 * (Math.random()-.5), Vec.of( 0,1,0 ) )
                         .times( Mat4.rotation( Math.PI/2 * (Math.random()-.5), Vec.of( 1,0,0 ) ) )
                         .times( Mat4.translation([ 0,0,-150 ]) ) );

      this.thrust = Vec.of( 0,0,0 );
      this.model_transform = Mat4.identity();
    }
  make_control_panel()
    {                                 // make_control_panel(): Sets up a panel of interactive HTML elements, including
                                      // buttons with key bindings for affecting this scene, and live info readouts.

                                 // TODO (#5b): Add a button control.  Provide a callback that flips the boolean value of "this.lights_on".
       // this.key_triggered_button(  thrust[1]=1; 
      this.key_triggered_button( "Up",     [ " " ], () => this.thrust[1] = 1, undefined, () => this.thrust[1] = 0 );
      this.key_triggered_button( "Forward",[ "w" ], () => this.thrust[2] =  1, undefined, () => this.thrust[2] = 0 );
      this.new_line();
      this.key_triggered_button( "Left",   [ "a" ], () => this.thrust[0] =  -1, undefined, () => this.thrust[0] = 0 );
      this.key_triggered_button( "Back",   [ "s" ], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0 );
      this.key_triggered_button( "Right",  [ "d" ], () => this.thrust[0] = 1, undefined, () => this.thrust[0] = 0 );
      this.new_line();
      this.key_triggered_button( "Accelerate",   [ "shift" ], () => this.thrust[1] =  3, undefined, () => this.thrust[1] = 0 ); 

    }
  display( context, program_state )
    {    
      if( !context.scratchpad.controls ) 
        {     
          this.children.push( context.scratchpad.controls = new defs.Movement_Controls() ); 
          this.children.push( this.camera_teleporter = new Camera_Teleporter() );       
          program_state.set_camera( Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) ) );
          this.initial_camera_location = program_state.camera_inverse;
          program_state.projection_transform = Mat4.perspective( Math.PI/4, context.width/context.height, 1, 200 );
        }

                                                                      // Find how much time has passed in seconds; we can use
                                                                      // time as an input when calculating new transforms:
      const t = program_state.animation_time / 1000;

                                                  // Have to reset this for each frame:
      this.camera_teleporter.cameras = [];
   

      const wheat = Color.of(0.960784, 0.870588, 0.701961, 1), papayawhip = Color.of(1, 0.937255, 0.835294, 1), cyan = Color.of(0,1,1,1);
      const darkgray = Color.of(0.662745, 0.662745, 0.662745, 1), gold = Color.of(1, 0.843137, 0, 1), brown = Color.of(0.823529, 0.411765, 0.117647, 1 );
      
      program_state.lights = [ new Light( Vec.of( 0,0,0,1 ), Color.of( 1,1,1,1 ), 100000 ) ];                        
      const modifier = this.lights_on ? { ambient: 0.3 } : { ambient: 0.0 };

      let model_transform = Mat4.identity();
      var _this = this;

      function play_sound( name, volume = 1 )
      { 
        if( 0 < _this.sounds[ name ].currentTime && _this.sounds[ name ].currentTime < .3 ) return;
        _this.sounds[ name ].currentTime = 0;
        _this.sounds[ name ].volume = Math.min(Math.max(volume, 0), 1);
        _this.sounds[ name ].play();
      }


      function draw_car(context, program_state, car_transform)
      {
          let base_transform = model_transform.times( Mat4.scale(Vec.of(2.5,0.8,8)) );
          _this.shapes.cube.draw(context, program_state, base_transform, _this.materials.plastic.override( wheat ));

          base_transform = base_transform.times( Mat4.scale(Vec.of(1/2.5, 1/0.8,1/8)) );

          let wheel1_transform = base_transform.times( Mat4.translation([2.5,-1,-6]))
                                               .times( Mat4.rotation(Math.PI/2, [0,1,0]))
                                               .times( Mat4.scale(Vec.of(1,1,2)));

          let wheel2_transform = base_transform.times( Mat4.translation([-2.5,-1,-6]))
                                               .times( Mat4.rotation(Math.PI/2, [0,1,0]))
                                               .times( Mat4.scale(Vec.of(1,1,2)));

          let wheel3_transform = base_transform.times( Mat4.translation([2.5,-1,6]))
                                               .times( Mat4.rotation(Math.PI/2, [0,1,0]))
                                               .times( Mat4.scale(Vec.of(1,1,2)));  

          let wheel4_transform = base_transform.times( Mat4.translation([-2.5,-1,6]))
                                               .times( Mat4.rotation(Math.PI/2, [0,1,0]))
                                               .times( Mat4.scale(Vec.of(1,1,2)));                                                                

          _this.shapes.torus.draw(context, program_state, wheel1_transform, _this.materials.plastic.override( darkgray ));
          _this.shapes.torus.draw(context, program_state, wheel2_transform, _this.materials.plastic.override( darkgray ));
          _this.shapes.torus.draw(context, program_state, wheel3_transform, _this.materials.plastic.override( darkgray ));
          _this.shapes.torus.draw(context, program_state, wheel4_transform, _this.materials.plastic.override( darkgray ));

          let light1_transform = base_transform.times( Mat4.translation([1.8,1.3,7]))
                                               .times( Mat4.scale(Vec.of(0.5,0.5,0.5)));
          _this.shapes.square.draw(context, program_state, light1_transform, _this.materials.plastic.override( gold ));
          let side1_transform = light1_transform.times( Mat4.scale(Vec.of(2,2,2)))
                                                .times( Mat4.rotation(Math.PI/2, [0,1,0]))
                                                .times( Mat4.translation([0,-0.5,-0.5]));
          _this.shapes.triangle.draw(context, program_state, side1_transform, _this.materials.plastic.override( darkgray));
          _this.shapes.triangle.draw(context, program_state, side1_transform.times( Mat4.translation([0,0,1])), _this.materials.plastic.override(darkgray));
          let top1_transform = side1_transform.times( Mat4.scale(Vec.of(2,2,2)))
                                              .times( Mat4.translation([.18,.33,.25]))
                                              .times( Mat4.rotation(Math.PI/4, [0,0,-1]))
                                              .times( Mat4.scale(Vec.of(0.4,0.05,0.25)));
          _this.shapes.cube.draw(context, program_state, top1_transform, _this.materials.plastic.override( darkgray));

          let light2_transform = base_transform.times( Mat4.translation([-1.8,1.3,7]))
                                               .times( Mat4.scale(Vec.of(0.5,.5,.5)))
          _this.shapes.square.draw(context, program_state, light2_transform, _this.materials.plastic.override( gold ));

          let side2_transform = light2_transform.times( Mat4.scale(Vec.of(2,2,2)))
                                                .times( Mat4.rotation(Math.PI/2, [0,1,0]))
                                                .times( Mat4.translation([0,-0.5,-0.5]));
          _this.shapes.triangle.draw(context, program_state, side2_transform, _this.materials.plastic.override( darkgray));
          _this.shapes.triangle.draw(context, program_state, side2_transform.times( Mat4.translation([0,0,1])), _this.materials.plastic.override(darkgray));

          let top2_transform = side2_transform.times( Mat4.scale(Vec.of(2,2,2)))
                                              .times( Mat4.translation([.18,.33,.25]))
                                              .times( Mat4.rotation(Math.PI/4, [0,0,-1]))
                                              .times( Mat4.scale(Vec.of(0.4,0.05,0.25)));
          _this.shapes.cube.draw(context, program_state, top2_transform, _this.materials.plastic.override( darkgray));

          let window_transform = base_transform.times( Mat4.translation([2.5,.8,0]))
                                               .times( Mat4.scale([2.5,2.5,2.5]))
                                               .times( Mat4.rotation(Math.PI/2, [0,-1,0]));
          _this.shapes.triangle.draw(context, program_state, window_transform, _this.materials.plastic.override( cyan ));
          _this.shapes.triangle.draw(context, program_state, window_transform.times( Mat4.translation([0,0,2])), _this.materials.plastic.override( cyan ));

          let window_transform2 = window_transform.times( Mat4.scale([1/2.5,1/2.5,1/2.5]))
                                                  .times( Mat4.translation([-2,1.25,0]))
                                                  .times( Mat4.scale([2,1.25,1]));
          _this.shapes.square.draw(context, program_state, window_transform2, _this.materials.plastic.override( cyan ));
          _this.shapes.square.draw(context, program_state, window_transform2.times( Mat4.translation([0,0,5])), _this.materials.plastic.override( cyan ));

          let decor_transform1 = base_transform.times( Mat4.translation([2.5,2.05,0]))
                                               .times( Mat4.rotation(Math.PI/2, [0,0,-1]))
                                               .times( Mat4.scale([1.25,0.05,0.05]));

                                                                                    
          _this.shapes.cube.draw(context, program_state, decor_transform1, _this.materials.plastic.override( papayawhip));
          _this.shapes.cube.draw(context, program_state, decor_transform1.times( Mat4.translation([0,-100,0])), _this.materials.plastic.override( papayawhip));

          let decor_transform2 = base_transform.times( Mat4.translation([0,1.1,4.625]))
                                               .times( Mat4.scale([1,0.3,3.375]))

          _this.shapes.cube.draw(context, program_state, decor_transform2, _this.materials.plastic.override( papayawhip ));

          let front_transform = base_transform.times( Mat4.translation([0,2.05,1.25]))
                                              .times( Mat4.rotation(Math.PI/4, [-1,0,0]))
                                              .times( Mat4.scale([2.5,1.767,1]));

          _this.shapes.square.draw(context, program_state, front_transform, _this.materials.plastic.override( cyan ));

          let seattop_transform = base_transform.times( Mat4.translation([0,3.35,-2]))
                                                .times( Mat4.scale([2.5,0.05,2]))
           
          _this.shapes.cube.draw(context, program_state, seattop_transform, _this.materials.plastic.override( papayawhip)); 

          let seatback_transform = base_transform.times( Mat4.translation([0,2.05,-4]))
                                                 .times( Mat4.scale([2.5,1.25,0.05])) 
           
          _this.shapes.cube.draw(context, program_state, seatback_transform, _this.materials.plastic.override( papayawhip ));

          let rear_transform = base_transform.times( Mat4.translation([0,1.3,-7.5]))
                                             .times( Mat4.scale([2.5,.5,.5]))

          _this.shapes.cube.draw(context, program_state, rear_transform, _this.materials.plastic.override( papayawhip )); 

          let beam_transform = base_transform.times( Mat4.translation([2.5,2.05,1.25]))
                                             .times( Mat4.rotation(Math.PI/4, [1,0,0]))
                                             .times( Mat4.scale([0.05, 0.05,1.767]))

          _this.shapes.cube.draw(context, program_state, beam_transform, _this.materials.plastic.override( papayawhip ));
          _this.shapes.cube.draw(context, program_state, beam_transform.times( Mat4.translation([-100,0,0])), _this.materials.plastic.override( papayawhip ));

          let mirror1_transform = base_transform.times( Mat4.translation([2.5,2.05,1.25]))
                                                .times( Mat4.rotation(Math.PI/3, [1,0,0]))
                                                .times( Mat4.rotation(Math.PI/6, [0,0,-1]))
                                                .times( Mat4.translation([.6,0,0]))
                                                .times( Mat4.scale([.6,.2,.4]))
          _this.shapes.cube.draw(context, program_state, mirror1_transform, _this.materials.plastic.override( papayawhip ));

          let mirror2_transform = base_transform.times( Mat4.translation([-2.5,2.05,1.25]))
                                                .times( Mat4.rotation(Math.PI/3, [1,0,0]))
                                                .times( Mat4.rotation(Math.PI/6, [0,0,1]))
                                                .times( Mat4.translation([-.6,0,0]))
                                                .times( Mat4.scale([.6,.2,.4]))

           _this.shapes.cube.draw(context, program_state, mirror2_transform, _this.materials.plastic.override( papayawhip ));                                                                                                                                                                                 

      }

      function draw_tree( context, program_state, model_transform)
      {
        let base_transform = model_transform.times( Mat4.rotation( Math.PI/2, [1,0,0]))
                                            .times( Mat4.scale([1,1,20]));
        
        _this.shapes.cylinder.draw(context, program_state, base_transform, _this.materials.plastic.override( brown ));

        let leaf_transform = model_transform.times( Mat4.translation([0,8,0]))
                                            .times( Mat4.scale([4,4,4]))
        _this.shapes.ball_4.draw(context, program_state, leaf_transform, _this.materials.plastic.override( Color.of(0,1,0,1) ));
        _this.shapes.ball_4.draw(context, program_state, leaf_transform.times( Mat4.translation([0.6,-2/3,0])), _this.materials.plastic.override( Color.of(0,1,0,1)));
        _this.shapes.ball_4.draw(context, program_state, leaf_transform.times( Mat4.translation([-0.6,-2/3,-0.6])), _this.materials.plastic.override( Color.of(0,1,0,1)));
        _this.shapes.ball_4.draw(context, program_state, leaf_transform.times( Mat4.translation([-0.6,-2/3,0.6])), _this.materials.plastic.override( Color.of(0,1,0,1)));                                    
      }
      
      function draw_pinetree(context, program_state, model_transform)
      {
        let base_transform = model_transform.times( Mat4.rotation( Math.PI/2, [1,0,0]))
                                            .times( Mat4.scale([1,1,12]));
        
        _this.shapes.cylinder.draw(context, program_state, base_transform, _this.materials.plastic.override( brown ));

        let leaf_transform = model_transform.times( Mat4.translation([0,13,0]))
                                            .times( Mat4.rotation(2.16, [1,0,-1]))
                                            //.times( Mat4.rotation(Math.PI*3/4, [0,0,-1]))
                                            //.times( Mat4.rotation(Math.PI/4, [-1,0,0]))
                                            .times( Mat4.scale([10,10,10]))
        _this.shapes.tetrahedron.draw(context, program_state, leaf_transform, _this.materials.plastic.override( Color.of(0,1,0,1)));

        let leaf_transform2 = model_transform.times( Mat4.translation([0,16,0]))
                                            .times( Mat4.rotation(Math.PI*3/4, [0,0,-1]))
                                            .times( Mat4.rotation(Math.PI/4, [-1,0,0]))
                                            .times( Mat4.scale([10,10,10]))
        //_this.shapes.tetrahedron.draw(context, program_state, leaf_transform2, _this.materials.plastic.override( Color.of(0,1,0,1)));
                                            
       let leaf_transform3 = model_transform.times( Mat4.translation([0,20,0]))
                                            .times( Mat4.rotation(Math.PI*3/4, [0,0,-1]))
                                            .times( Mat4.rotation(Math.PI/4, [-1,0,0]))
                                            .times( Mat4.scale([10,10,10]))
        //_this.shapes.tetrahedron.draw(context, program_state, leaf_transform3, _this.materials.plastic.override( Color.of(0,1,0,1)));
      }
      
      function draw_skybox( context, program_state, model_transform)
      {
        let front_transform = model_transform.times( Mat4.translation([0,0,-100]))
                                             .times( Mat4.scale([100,100,100]))
                                             .times( Mat4.rotation(Math.PI, [0,1,0]))
        _this.shapes.square.draw(context, program_state, front_transform, _this.materials.skybox_zneg);
        let back_transform = model_transform.times( Mat4.translation([0,0,100]))
                                            .times( Mat4.scale([100,100,100]))
        _this.shapes.square.draw(context, program_state, back_transform, _this.materials.skybox_zpos);

        let right_transform = model_transform.times( Mat4.translation([100,0,0]))
                                             .times( Mat4.scale([100,100,100]))
                                             .times( Mat4.rotation(Math.PI/2, [0,1,0]))
        _this.shapes.square.draw(context, program_state, right_transform, _this.materials.skybox_xpos);
        let left_transform = model_transform.times( Mat4.translation([-100,0,0]))
                                            .times( Mat4.scale([100,100,100]))
                                            .times( Mat4.rotation(Math.PI/2, [0,-1,0]))
        _this.shapes.square.draw(context, program_state, left_transform, _this.materials.skybox_xneg);

        let up_transform = model_transform.times( Mat4.translation([0,100,0]))
                                          .times( Mat4.scale([100,100,100]))
                                          .times( Mat4.rotation(Math.PI/2, [-1,0,0]))
        _this.shapes.square.draw(context, program_state, up_transform, _this.materials.skybox_ypos);
        let down_transform = model_transform.times( Mat4.translation([0,-100,0]))
                                          .times( Mat4.scale([100,100,100]))
                                          .times( Mat4.rotation(Math.PI/2, [1,0,0]))
        _this.shapes.square.draw(context, program_state, down_transform, _this.materials.skybox_yneg);                                                                                                                                                                                  
      }

      this.shapes.square.draw(context, program_state, model_transform.times( Mat4.scale([2,2,2])), this.materials.text_box);

    }
}

const Additional_Scenes = [];

export { Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs }


const Camera_Teleporter = defs.Camera_Teleporter =
class Camera_Teleporter extends Scene
{                               // **Camera_Teleporter** is a helper Scene meant to be added as a child to
                                // your own Scene.  It adds a panel of buttons.  Any matrices externally
                                // added to its "this.cameras" can be selected with these buttons. Upon
                                // selection, the program_state's camera matrix slowly (smoothly)
                                // linearly interpolates itself until it matches the selected matrix.
  constructor() 
    { super();
      this.cameras = [];
      this.selection = 0;
    }
  make_control_panel()
    {                                // make_control_panel(): Sets up a panel of interactive HTML elements, including
                                     // buttons with key bindings for affecting this scene, and live info readouts.
      
      this.key_triggered_button(  "Enable",       [ "e" ], () => this.enabled = true  );
      this.key_triggered_button( "Disable", [ "Shift", "E" ], () => this.enabled = false );
      this.new_line();
      this.key_triggered_button( "Previous location", [ "g" ], this.decrease );
      this.key_triggered_button(              "Next", [ "h" ], this.increase );
      this.new_line();
      this.live_string( box => { box.textContent = "Selected camera location: " + this.selection } );
    }  
  increase() { this.selection = Math.min( this.selection + 1, Math.max( this.cameras.length-1, 0 ) ); }
  decrease() { this.selection = Math.max( this.selection - 1, 0 ); }   // Don't allow selection of negative indices.
  display( context, program_state )
  {
    const desired_camera = this.cameras[ this.selection ];
    if( !desired_camera || !this.enabled )
      return;
    const dt = program_state.animation_delta_time;
    program_state.set_camera( desired_camera.map( (x,i) => Vec.from( program_state.camera_inverse[i] ).mix( x, .01*dt ) ) );    
  }
}


const Planar_Star = defs.Planar_Star =
class Planar_Star extends Shape
{                                 // **Planar_Star** defines a 2D five-pointed star shape.  The star's inner 
                                  // radius is 4, and its outer radius is 7.  This means the complete star 
                                  // fits inside a 14 by 14 sqaure, and is centered at the origin.
  constructor()
    { super( "position", "normal", "texture_coord" );
                    
      this.arrays.position.push( Vec.of( 0,0,0 ) );
      for( let i = 0; i < 11; i++ )
        {
          const spin = Mat4.rotation( i * 2*Math.PI/10, Vec.of( 0,0,-1 ) );

          const radius = i%2 ? 4 : 7;
          const new_point = spin.times( Vec.of( 0,radius,0,1 ) ).to3();

          this.arrays.position.push( new_point );
          if( i > 0 )
            this.indices.push( 0, i, i+1 )
        }         
                 
      this.arrays.normal        = this.arrays.position.map( p => Vec.of( 0,0,-1 ) );

                                      // TODO (#5a):  Fill in some reasonable texture coordinates for the star:
      // this.arrays.texture_coord = this.arrays.position.map( p => 
    }
}

const Gouraud_Shader = defs.Gouraud_Shader =
class Gouraud_Shader extends defs.Phong_Shader
{ 
  shared_glsl_code()           // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { 
                          // TODO (#6b2.1):  Copy the Phong_Shader class's implementation of this function, but
                          // change the two "varying" vec3s declared in it to just one vec4, called color.
                          // REMEMBER:
                          // **Varying variables** are passed on from the finished vertex shader to the fragment
                          // shader.  A different value of a "varying" is produced for every single vertex
                          // in your array.  Three vertices make each triangle, producing three distinct answers
                          // of what the varying's value should be.  Each triangle produces fragments (pixels), 
                          // and the per-fragment shader then runs.  Each fragment that looks up a varying 
                          // variable will pull its value from the weighted average of the varying's value
                          // from the three vertices of its triangle, weighted according to how close the 
                          // fragment is to each extreme corner point (vertex).

      return `

      ` ;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { 
                                          // TODO (#6b2.2):  Copy the Phong_Shader class's implementation of this function,
                                          // but declare N and vertex_worldspace as vec3s local to function main,
                                          // since they are no longer scoped as varyings.  Then, copy over the
                                          // fragment shader code to the end of main() here.  Computing the Phong
                                          // color here instead of in the fragment shader is called Gouraud
                                          // Shading.  
                                          // Modify any lines that assign to gl_FragColor, to assign them to "color", 
                                          // the varying you made, instead.  You cannot assign to gl_FragColor from 
                                          // within the vertex shader (because it is a special variable for final
                                          // fragment shader color), but you can assign to varyings that will be 
                                          // sent as outputs to the fragment shader.

      return this.shared_glsl_code() + `
        void main()
          {
             
          } ` ;
    }
  fragment_glsl_code()         // ********* FRAGMENT SHADER ********* 
    {                          // A fragment is a pixel that's overlapped by the current triangle.
                               // Fragments affect the final image or get discarded due to depth.  

                               // TODO (#6b2.3):  Leave the main function almost blank, except assign gl_FragColor to
                               // just equal "color", the varying you made earlier.
      return this.shared_glsl_code() + `
        void main()
          {
                        
          } ` ;
    }
}


const Black_Hole_Shader = defs.Black_Hole_Shader =
class Black_Hole_Shader extends Shader         // Simple "procedural" texture shader, with texture coordinates but without an input image.
{ update_GPU( context, gpu_addresses, program_state, model_transform, material )
      { 
                  // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader 
                  // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
                  // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or 
                  // program (which we call the "Program_State").  Send both a material and a program state to the shaders 
                  // within this function, one data field at a time, to fully initialize the shader for a draw.

                  // TODO (#EC 1b):  Send the GPU the only matrix it will need for this shader:  The product of the projection, 
                  // camera, and model matrices.  The former two are found in program_state; the latter is directly 
                  // available here.  Finally, pass in the animation_time from program_state. You don't need to allow
                  // custom materials for this part so you don't need any values from the material object.
                  // For an example of how to send variables to the GPU, check out the simple shader "Funny_Shader".

        // context.uniformMatrix4fv( gpu_addresses.projection_camera_model_transform,       
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { 
                  // TODO (#EC 1c):  For both shaders, declare a varying vec2 to pass a texture coordinate between
                  // your shaders.  Also make sure both shaders have an animation_time input (a uniform).
      return `precision mediump float;
             
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    {
                          // TODO (#EC 1d,e):  Create the final "gl_Position" value of each vertex based on a displacement
                          // function.  Also pass your texture coordinate to the next shader.  As inputs,
                          // you have the current vertex's stored position and texture coord, animation time,
                          // and the final product of the projection, camera, and model matrices.
      return this.shared_glsl_code() + `

        void main()
        { 

        }`;
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { 
                          // TODO (#EC 1f):  Using the input UV texture coordinates and animation time,
                          // calculate a color that makes moving waves as V increases.  Store
                          // the result in gl_FragColor.
      return this.shared_glsl_code() + `
        void main()
        { 

        }`;
    }
}

const Sun_Shader = defs.Sun_Shader =
class Sun_Shader extends Shader
{
    update_GPU( context, gpu_addresses, program_state, model_transform, material )
      { 
        //super.update_GPU( context, gpu_addresses, gpu_state, model_transform, material );
        const [ P, C, M ] = [ program_state.projection_transform, program_state.camera_inverse, model_transform ],
                      PCM = P.times( C ).times( M );
        context.uniformMatrix4fv( gpu_addresses.projection_camera_model_transform, false, Mat.flatten_2D_to_1D( PCM.transposed() ) );
        context.uniform1f ( gpu_addresses.time, program_state.animation_time / 1000 );
      }
  shared_glsl_code()           
    {
      return `precision highp float;
             
      `;
    }
  vertex_glsl_code()           
    {
                          
      return this.shared_glsl_code() + `
        precision highp int;

        uniform mat4 projection_camera_model_transform;

        // Default attributes provided by THREE.js. Attributes are only available in the
        // vertex shader. You can pass them to the fragment shader using varyings
        attribute vec3 position;
        attribute vec3 normal;
        attribute vec2 uv;
        attribute vec2 uv2;

        // Examples of variables passed from vertex to fragment shader
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec2 vUv2;

        void main() {

            // To pass variables to the fragment shader, you assign them here in the
            // main function. Traditionally you name the varying with vAttributeName
            vNormal = normal;
            vUv = uv;
            vUv2 = uv2;
            vPosition = position;

            // This sets the position of the vertex in 3d space. The correct math is
            // provided below to take into account camera and object data.
            gl_Position = projection_camera_model_transform * vec4( position, 1.0 );

        }
      `;
    }
  fragment_glsl_code()           
    { 
                         
      return this.shared_glsl_code() + `
        precision highp float;

        varying vec2 vUv;
        uniform float time;
        const float speed = 8.0;
        const float fadeAway = 0.5;
        const vec3 color = vec3(0.8745, 0.5725, 0.0588);
        const vec2 resolution = vec2(2,2);
        const float uniformity = 10.0;
        
        void main(void) {
            float t = time * speed;
            vec2 position = (vUv.xy - resolution.xy * .5) / resolution.x;
            float angle = atan(position.y, position.x) / (2. * 3.14159265359);
            angle -= floor(angle);
            float rad = length(position);
            float angleFract = fract(angle * 256.);
            float angleRnd = floor(angle * 256.) + 1.;
            float angleRnd1 = fract(angleRnd * fract(angleRnd * .7235) * 45.1);
            float angleRnd2 = fract(angleRnd * fract(angleRnd * .82657) * 13.724);
            float t2 = t + angleRnd1 * uniformity;
            float radDist = sqrt(angleRnd2);
            float adist = radDist / rad * .1;
            float dist = (t2 * .1 + adist);
            dist = abs(fract(dist) - fadeAway);

            float outputColor = (1.0 / (dist)) * cos(0.7 * sin(t)) * adist / radDist / 30.0;
            angle = fract(angle + .61);
            gl_FragColor = vec4(outputColor * color, 1.0);
        }
      `;
    }
}