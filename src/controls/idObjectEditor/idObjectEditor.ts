import { Control } from "../control";
import { IdPopup, IdInput } from "../controls";
import { LineStyle, ObjectKind } from "../../enums/enums";
import { Obj } from "../../models/obj";

export class IdObjectEditor extends Control {
  private ctrlName: IdInput;
  private ctrlDescription: IdInput;
  private obj: Obj;
  private btnDelete: HTMLElement;
  private btnActor: IdPopup;
  private btnItem: IdPopup;
  private btnScenery: IdPopup;
  private static dragParent: HTMLElement;
  private static dragObj: Obj;
  private static tagName: string;
  private dropDiv: HTMLElement;
  private dropAsChildDiv: HTMLElement;

  // 
  // Create a new instance of IdObjectEditor by providing a query selector that
  // yields an id-object-editor element.
  //
  constructor(elem: HTMLElement|string, base?: HTMLElement) {
    super(elem, base);

    // Expand a handlebars template into the top element.
    this.elem.innerHTML = Handlebars.templates.idObjectEditor({ });

    this.elem.addEventListener('mousedown', (e) => {
      IdObjectEditor.tagName = (e.target as HTMLElement).tagName.toLowerCase();
    });

    this.elem.addEventListener('dragstart', (e) => {
      if(IdObjectEditor.tagName == "input") {
        return false;
      }
      e.dataTransfer.setData('text', 'foo');
      IdObjectEditor.dragObj = this.obj;
      IdObjectEditor.dragParent = this.elem.parentElement;
      this.elem.classList.add('dragged');
      IdObjectEditor.dragParent.classList.add('dragging');
    });

    this.elem.addEventListener('dragend', (e) => {
      this.elem.classList.remove('dragged');
      IdObjectEditor.dragParent.classList.remove('dragging');
    });

    this.dropDiv = this.elem.querySelector('.drop');
    this.dropAsChildDiv = this.elem.querySelector('.drop-child');
    let me = this;

    this.dropDiv.addEventListener('dragover', (e) => { return this.handleDragOver(e); }, false);
    this.dropAsChildDiv.addEventListener('dragover', (e) => { return this.handleDragOver(e); }, false);

    this.dropDiv.addEventListener('dragenter', function(e) { return me.handleDragEnter(this); });
    this.dropAsChildDiv.addEventListener('dragenter', function(e) { return me.handleDragEnter(this); });

    this.dropDiv.addEventListener('dragleave', function(e) { return me.handleDragLeave(this); });
    this.dropAsChildDiv.addEventListener('dragleave', function(e) { return me.handleDragLeave(this); });

    this.dropDiv.addEventListener('drop', function(e) { return me.handleDrop(e, this); });
    this.dropAsChildDiv.addEventListener('drop', function(e) { return me.handleDropAsChild(e, this); });

    this.ctrlName = new IdInput('.js-name', this.elem).addEventListener('input', () => { this.obj.name = this.ctrlName.value; });
    this.ctrlDescription = new IdInput('.js-description', this.elem).addEventListener('input', () => { this.obj.description = this.ctrlDescription.value; });
    this.btnDelete = this.elem.querySelector('a');
    this.btnDelete.addEventListener('click', () => { this.delete(); });

    this.btnItem = new IdPopup('.js-item', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Item); });
    this.btnScenery = new IdPopup('.js-scenery', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Scenery); });
    this.btnActor = new IdPopup('.js-actor', this.elem).addEventListener('click', () => { this.setKind(ObjectKind.Actor); });
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  private handleDragEnter(elem: HTMLElement) {
    elem.classList.add('over');
  }

  private handleDragLeave(elem: HTMLElement) {
    elem.classList.remove('over');
  }

  private handleDrop(e: Event, elem: HTMLElement) {
    e.preventDefault();
    e.stopPropagation();
    let evt = new CustomEvent('drop', { detail: IdObjectEditor.dragObj });
    this.elem.dispatchEvent(evt);
    return false;
  }

  private handleDropAsChild(e: Event, elem: HTMLElement) {
    e.preventDefault();
    e.stopPropagation();
    let evt = new CustomEvent('dropAsChild', { detail: IdObjectEditor.dragObj });
    this.elem.dispatchEvent(evt);
    return false;
  }  

  private setKind(kind: ObjectKind) {
    this.btnActor.selected = kind == ObjectKind.Actor;
    this.btnItem.selected = kind == ObjectKind.Item;
    this.btnScenery.selected = kind == ObjectKind.Scenery;
    this.obj.kind = kind;
  }

  set value(obj: Obj) {
    this.obj = obj;
    this.ctrlName.value = obj.name;
    this.setKind(obj.kind);
  }    

  get value(): Obj {
    return this.obj;
  }

  private delete() {
    let evt = new CustomEvent('delete');
    this.elem.dispatchEvent(evt);    
  }

  //
  // Returns reference to self for easy chaining.
  // 
  public addEventListener(type: string, f: any): IdObjectEditor {
    this.elem.addEventListener(type, f);
    return this;
  }
}