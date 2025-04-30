class Player {
    // dictionary of character animations
    static animations = {
        "run": { "frames": new Image(), "fCount": 10 }, 
        "idle": { "frames": new Image(), "fCount": 6 },
        "ground_combo_1": { "frames": new Image(), "fCount": 10 }, 
        "ground_combo_2": { "frames": new Image(), "fCount": 12 },
        "jump": { "frames": new Image(), "fCount": 4 },
        "fall": { "frames": new Image(), "fCount": 4 },
        "dash": { "frames": new Image(), "fCount": 7 },
        "air_combo_1": { "frames": new Image(), "fCount": 8 },
        "air_combo_2": { "frames": new Image(), "fCount": 8 },
        "air_combo_3": { "frames": new Image(), "fCount": 8 },
        "lunging_stab": { "frames": new Image(), "fCount": 10 } // Add lunging stab animation
    };
   
    static {
        // Load sprites
        this.animations["run"]["frames"].src = "Sprites/MCSprite/Run.png";
        this.animations["idle"]["frames"].src = "Sprites/MCSprite/Idle.png";
        this.animations["ground_combo_1"]["frames"].src = "Sprites/MCSprite/GroundCombo1.png";
        this.animations["ground_combo_2"]["frames"].src = "Sprites/MCSprite/GroundCombo2.png";
        this.animations["jump"]["frames"].src = "Sprites/MCSprite/Jump.png";
        this.animations["fall"]["frames"].src = "Sprites/MCSprite/Fall.png";
        this.animations["dash"]["frames"].src = "Sprites/MCSprite/Dash.png";
        this.animations["air_combo_1"]["frames"].src = "Sprites/MCSprite/AirCombo1.png";
        this.animations["air_combo_2"]["frames"].src = "Sprites/MCSprite/AirCombo2.png";
        this.animations["air_combo_3"]["frames"].src = "Sprites/MCSprite/AirCombo3.png";
        this.animations["lunging_stab"]["frames"].src = "Sprites/MCSprite/LungingStab.png";
        
        // Simple image load logging
        for (const key in this.animations) {
            const img = this.animations[key]["frames"];
            img.onload = () => {
                console.log(`Loaded ${key} animation`);
            };
        }
    }

    constructor() {
        // Existing properties
        this.x = 100;
        this.y = 100;
        this.width = 80;
        this.height = 48;
        this.velocityY = 0;
        this.gravity = 0.35;
        this.jumpPower = -14;
        this.grounded = false;
        this.velocityX = 0;
        this.frameIndex = 0;
        this.frameSpeed = 12; // Increased from 8 for faster animations
        this.lastFrameTime = performance.now(); // Initialize with current time
        this.frameDuration = 1000 / 60;
        this.moving = false;
        this.jumping = false;
        this.facingLeft = false;
        this.state = "idle";
        this.waitAnim = false;
        this.isMoveable = true;
        this.attackCooldown = 0;
        this.lastAttackTime = 0;
        this.phaseThrough = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.dashing = false;
        this.dashSpeed = 22;
        this.dashDuration = 10;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.dashCooldownTime = 35;
        this.invincible = false;
        this.airComboCount = 0;
        this.airComboTimer = 0;
        this.airComboCooldown = 0;
        
        // Lunging stab properties
        this.lungingStab = false;
        this.lungingStabSpeed = 12;
        this.lungingStabDuration = 20;
        this.lungingStabTimer = 0;
        this.lungingStabCooldown = 0;
        this.lungingStabCooldownTime = 300; // 5 seconds at 60 FPS
    }

    update() { 
        this.velocityX = 0;
        this.moving = false;
        
        // Handle dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }
        
        // Handle lunging stab cooldown
        if (this.lungingStabCooldown > 0) {
            this.lungingStabCooldown--;
        }
        
        // Lunging stab activation with C key
        if (keys["KeyC"] && this.lungingStabCooldown === 0 && !this.lungingStab && !this.dashing) {
            this.lungingStab = true;
            this.lungingStabTimer = this.lungingStabDuration;
            this.state = "lunging_stab";
            this.frameIndex = 0;
            this.waitAnim = true;
            this.isMoveable = false;
        }
        
        // Handle active lunging stab
        if (this.lungingStab) {
            // Apply lunging stab velocity in the direction player is facing
            this.velocityX = this.facingLeft ? -this.lungingStabSpeed : this.lungingStabSpeed;
            
            // Decrement lunging stab timer
            this.lungingStabTimer--;
            
            // End lunging stab when timer runs out
            if (this.lungingStabTimer <= 0) {
                this.lungingStab = false;
                this.lungingStabCooldown = this.lungingStabCooldownTime;
                this.waitAnim = false;
                this.isMoveable = true;
            }
        }
        // Handle active dash
        if (this.dashing) {
            // Apply dash velocity in the direction player is facing
            this.velocityX = this.facingLeft ? -this.dashSpeed : this.dashSpeed;
            this.velocityY = 0; // No gravity during dash
            
            // Decrement dash timer
            this.dashTimer--;
            
            // End dash when timer runs out
            if (this.dashTimer <= 0) {
                this.dashing = false;
                this.dashCooldown = this.dashCooldownTime;
                this.invincible = false; // Remove invincibility when dash ends
            }
        } 
        // Normal movement when not dashing or lunging
        else if (this.isMoveable) {
            // Player horizontal movement
            if (keys["ArrowRight"]) {
                this.velocityX = 8;
                this.moving = true;
                this.facingLeft = false;
            } else if (keys["ArrowLeft"]) {
                this.velocityX = -8;
                this.moving = true;
                this.facingLeft = true;
            }
        }
        
        // Dash activation with X key - can be used in any animation state
        if (keys["KeyX"] && this.dashCooldown === 0 && !this.dashing) {
            this.dashing = true;
            this.dashTimer = this.dashDuration;
            this.state = "dash";
            this.frameIndex = 0;
            this.invincible = true; // Add invincibility during dash
        }
        
        // REMOVE ALL THIS DUPLICATE CODE BELOW
        // Delete from here...
        /*
        // Handle active dash
        if (this.dashing) {
            // Apply dash velocity in the direction player is facing
            this.velocityX = this.facingLeft ? -this.dashSpeed : this.dashSpeed;
            this.velocityY = 0; // No gravity during dash
            
            // Decrement dash timer
            this.dashTimer--;
            
            // End dash when timer runs out
            if (this.dashTimer <= 0) {
                this.dashing = false;
                this.dashCooldown = this.dashCooldownTime;
                this.invincible = false; // Remove invincibility when dash ends
            }
        } 
        // Normal movement when not dashing
        else {
            // Player horizontal movement - modified to allow limited movement during attacks
            if (keys["ArrowRight"]) {
                // Allow movement during attack but at reduced speed
                const moveSpeed = this.isMoveable ? 5 : 2;
                this.velocityX = moveSpeed;
                this.moving = true;
                this.facingLeft = false;
            } else if (keys["ArrowLeft"]) {
                // Allow movement during attack but at reduced speed
                const moveSpeed = this.isMoveable ? 5 : 2;
                this.velocityX = -moveSpeed;
                this.moving = true;
                this.facingLeft = true;
            }
        }
        */
        // ...to here (delete all this duplicate code)

        // Check for down key to phase through platforms (only when not dashing)
        if (!this.dashing && keys["ArrowDown"]) {
            this.phaseThrough = true;
            if (this.grounded) {
                this.velocityY = 1; // Small push to start falling
            }
        } else {
            this.phaseThrough = false;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        cameraX = this.x - canvas.width / 4;

        // Apply gravity only when not dashing
        if (!this.dashing) {
            this.velocityY += this.gravity;
        }
        this.y += this.velocityY;
        
        // Check if player has fallen off the screen
        if (this.y > canvas.height + 100) {
            // Reset player position instead of game over
            this.resetPosition();
        }
        
        this.grounded = false;
        
        // Process platform collisions
        for (let platform of platforms) {
            // Skip collision check if phasing through
            if (this.phaseThrough) {
                continue;
            }
            
            // Normal platform collision
            if (this.y + this.height > platform.y &&
                this.y + this.height - this.velocityY <= platform.y &&
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width) 
            {
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.grounded = true;
                this.jumping = false;
                this.hasDoubleJumped = false; // Reset double jump when grounded
                this.canDoubleJump = false;
                this.airComboCount = 0; // Reset air combo count when grounded
            }
        }

        // Track jump key state for double jump
        const jumpKeyPressed = keys["Space"] || keys["ArrowUp"];
        
        // First jump
        if (jumpKeyPressed && this.grounded) {
            this.velocityY = this.jumpPower;
            this.grounded = false;
            this.jumping = true;
            this.canDoubleJump = true; // Enable double jump after first jump
            
            // Store the jump key state to prevent immediate double jump
            this.jumpKeyWasPressed = true;
        } 
        // Double jump - allow when falling or after jumping
        else if (jumpKeyPressed && !this.grounded && !this.hasDoubleJumped && !this.jumpKeyWasPressed) {
            // Allow double jump even if we didn't jump first (like when falling off a platform)
            this.velocityY = this.jumpPower * 0.8; // Slightly weaker double jump
            this.hasDoubleJumped = true;
            
            // Reset animation for double jump
            this.frameIndex = 0;
            this.state = "jump";
            
            // Store the jump key state
            this.jumpKeyWasPressed = true;
        }
        
        // Track when jump key is released
        if (!jumpKeyPressed) {
            this.jumpKeyWasPressed = false;
        }
        
        // Decrease air combo timer
        if (this.airComboTimer > 0) {
            this.airComboTimer--;
            
            // If air combo animation is complete, return to fall state
            if (this.airComboTimer === 0 && this.state.includes("air_combo")) {
                this.state = "fall";
                this.waitAnim = false;
                this.isMoveable = true;
            }
        }
        
        // Decrease air combo cooldown
        if (this.airComboCooldown > 0) {
            this.airComboCooldown--;
        }
        
        // Attack logic - ground and air combos
        if (keys["KeyZ"] && this.attackCooldown <= 0) {
            if (this.grounded) {
                // Ground combo logic (existing)
                this.attackCooldown = 10;
                
                if (this.state.includes("ground_combo") && 
                    this.frameIndex >= Player.animations[this.state]["fCount"] / 2) {
                    this.state = this.state === "ground_combo_1" ? "ground_combo_2" : "ground_combo_1";
                    this.frameIndex = 0;
                } 
                else if (!this.state.includes("ground_combo")) {
                    this.state = "ground_combo_1";
                    this.frameIndex = 0;
                }
                
                this.waitAnim = true;
                this.isMoveable = false;
                this.lastAttackTime = Date.now();
            } 
            else if (!this.grounded && this.airComboCooldown <= 0 && !this.state.includes("air_combo")) {
                // Air combo logic - start with air_combo_1
                this.attackCooldown = 8;
                this.airComboCooldown = 15;
                this.airComboTimer = 20;
                
                // Cycle through air combos
                if (this.airComboCount === 0) {
                    this.state = "air_combo_1";
                    this.airComboCount = 1;
                } else if (this.airComboCount === 1) {
                    this.state = "air_combo_2";
                    this.airComboCount = 2;
                } else {
                    this.state = "air_combo_3";
                    this.airComboCount = 0;
                }
                
                this.frameIndex = 0;
                this.waitAnim = true;
                this.isMoveable = false; // Limit movement during air attack
                this.velocityY = -1; // Small upward boost during air attack to slow falling
                this.lastAttackTime = Date.now();
            }
            else if (!this.grounded && this.state.includes("air_combo") && 
                     this.frameIndex >= Player.animations[this.state]["fCount"] / 2 &&
                     this.airComboCooldown <= 0) {
                // Continue air combo if already in one and halfway through animation
                this.attackCooldown = 8;
                this.airComboCooldown = 15;
                this.airComboTimer = 20;
                
                // Advance to next air combo
                if (this.state === "air_combo_1") {
                    this.state = "air_combo_2";
                    this.airComboCount = 2;
                } else if (this.state === "air_combo_2") {
                    this.state = "air_combo_3";
                    this.airComboCount = 0;
                } else {
                    this.state = "air_combo_1";
                    this.airComboCount = 1;
                }
                
                this.frameIndex = 0;
                this.velocityY = -1; // Small upward boost to extend air time
            }
        }
    
        // Decrease attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    
        // Auto-release from attack state if animation is complete
        if (this.waitAnim) {
            if (this.state.includes("ground_combo") && 
                this.frameIndex >= Player.animations[this.state]["fCount"] - 1) {
                this.waitAnim = false;
                this.isMoveable = true;
            }
            else if (this.state.includes("air_combo") && 
                     this.frameIndex >= Player.animations[this.state]["fCount"] - 1) {
                // Don't immediately end air combo - let the timer handle it
                // This allows for the animation to complete visually
                if (this.airComboTimer <= 0) {
                    this.waitAnim = false;
                    this.isMoveable = true;
                    this.state = "fall";
                }
            }
        }

        // State management with jump and fall animations
            // State management with jump and fall animations
            if (!this.waitAnim) {
                let newState;
                
                if (this.dashing) {
                    newState = "dash";
                } else if (!this.grounded) {
                    // Improved transition between jump and fall states
                    if (this.velocityY < -1) {
                        // Moving upward - use jump animation
                        newState = "jump";
                    } else if (this.velocityY > 1) {
                        // Moving downward - use fall animation
                        newState = "fall";
                        // Reset frame index for fall animation to ensure proper start
                        if (this.state !== "fall") {
                            this.frameIndex = 0;
                            this.frameCounter = 0;
                        }
                    } else {
                        // In the transition zone - keep current state
                        newState = this.state === "jump" || this.state === "fall" ? this.state : "fall";
                    }
                } else if (this.moving) {
                    newState = "run";
                } else {
                    newState = "idle";
                }
                
                // Only reset frame index when changing to a different animation type
                if (this.state !== newState) {
                    // Special case for transitioning between jump and fall
                    // Don't reset frame index when transitioning from jump to fall
                    const keepFrame = (this.state === "jump" && newState === "fall");
                    
                    this.state = newState;
                    
                    if (!keepFrame) {
                        this.frameIndex = 0;
                        this.frameCounter = 0;
                    }
                }
                
                this.isMoveable = true;
            }
        } // End of update method
    
        // Add this method to support the call from index.html
        // This method should exist but do nothing
        // Intentionally empty
        updateAnimation() {
        // Intentionally empty
        }
    
            draw() {
                // Get animation data
                const animData = Player.animations[this.state];
                if (!animData) return;
                
                const img = animData["frames"];
                if (!img || !img.complete) return;
                
                const currentTime = performance.now();
                const deltaTime = currentTime - this.lastFrameTime;
                
                // Calculate frame duration based on animation type - increased frame rates for faster animations
                let frameDuration;
                if (this.state.includes("ground_combo") || this.state.includes("air_combo") || this.state === "lunging_stab") {
                    frameDuration = 1000 / 30; // 30 FPS for attack animations (was 24)
                } else if (this.state === "run" || this.state === "dash") {
                    frameDuration = 1000 / 40; // 40 FPS for movement animations (was 30)
                } else if (this.state === "jump" || this.state === "fall") {
                    frameDuration = 1000 / 20; // 20 FPS for aerial animations (was 15)
                } else {
                    frameDuration = 1000 / 15; // 15 FPS for idle animation (was 12)
                }
                
                // Update frame index based on elapsed time with improved timing
                if (deltaTime >= frameDuration) {
                    // Calculate how many frames to advance based on elapsed time
                    // This helps prevent stuttering when framerate drops
                    const framesToAdvance = Math.min(Math.floor(deltaTime / frameDuration), 1);
                    this.frameIndex = (this.frameIndex + framesToAdvance) % animData["fCount"];
                    this.lastFrameTime = currentTime;
                }

                // Calculate drawing coordinates
                const drawX = Math.floor(this.x - cameraX);
                const drawY = Math.floor(this.y);
                const srcX = Math.floor(this.frameIndex * frameWidth);
                
                // Save the current context state
                ctx.save();
                
                try {
                    // Apply invincibility effect if needed
                    if (this.invincible) {
                        ctx.globalAlpha = Math.sin(Date.now() / 50) * 0.5 + 0.5;
                    }
                    
                    // Draw the sprite
                    if (this.facingLeft) {
                        ctx.translate(drawX + frameWidth, drawY);
                        ctx.scale(-1, 1);
                        ctx.drawImage(img, srcX, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                    } else {
                        ctx.drawImage(img, srcX, 0, frameWidth, frameHeight, drawX, drawY, frameWidth, frameHeight);
                    }
                    
                    // Draw debug outline
                    ctx.strokeStyle = 'red';
                    if (this.facingLeft) {
                        ctx.strokeRect(0, 0, this.width, this.height);
                    } else {
                        ctx.strokeRect(drawX, drawY, this.width, this.height);
                    }
                    
                    // Draw debug text
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.fillText(`State: ${this.state}, Frame: ${this.frameIndex}/${animData["fCount"]}`, drawX, drawY - 10);
                } catch (e) {
                    console.error("Error drawing animation:", e);
                } finally {
                    // Always restore the context state
                    ctx.restore();
                }
            }
    
    // Add a new method to reset player position
    resetPosition() {
        // Reset to starting position
        this.x = 100;
        this.y = 100;
        this.velocityY = 0;
        this.velocityX = 0;
        this.frameIndex = 0;
        this.frameCounter = 0;
        this.state = "idle";
        this.waitAnim = false;
        this.isMoveable = true;
        
        // Reset camera position
        cameraX = this.x - canvas.width / 4;
    }
}
