class Draggable {
  constructor(element) {
    if (!element) throw new Error("Element is required");

    this.element = element;
    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;

    this.init();
  }

  init() {
    this.element.style.position = "absolute"; // Ensure absolute positioning
    this.element.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
  }

  onMouseDown(event) {
    this.isDragging = true;
    this.offsetX = event.clientX - this.element.offsetLeft;
    this.offsetY = event.clientY - this.element.offsetTop;
    this.element.style.cursor = "grabbing";
  }

  onMouseMove(event) {
    if (!this.isDragging) return;
    this.element.style.left = `${event.clientX - this.offsetX}px`;
    this.element.style.top = `${event.clientY - this.offsetY}px`;
  }

  onMouseUp() {
    this.isDragging = false;
    this.element.style.cursor = "grab";
  }
}

// Make multiple elements draggable
document.querySelectorAll(".draggable").forEach((el) => new Draggable(el));

export default Draggable;
