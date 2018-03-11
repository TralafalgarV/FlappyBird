## Flappy Bird

### 效果演示

![flappybird](https://github.com/TralafalgarV/FlappyBird/blob/master/img/flappybird.gif)

### 实现细节
* 生成 CSS sprite 像素图片，32px * 32px；
* 图片转成 base64 编码，引入canvas；
* canvas切割成 32 * 32 网状图，并填充视口大小；
* 设置collisionContext和collisionContext的globalCompositeOperation属性值分别为"xor"和"destination-over"
* bird分别绘制到collisionContext和collisionContext，碰撞发生时，bird的像素会发生差别
* 通过状态机控制程序的运行状态