import { Component } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';  
   my_notes:any;
   my_notes_offline = [];

constructor(public afDB: AngularFireDatabase) {
    if(navigator.onLine){
     this.getNotes()
      .subscribe(
        notas =>{
         this.my_notes = notas;
          localStorage.setItem('my_notes', JSON.stringify(this.my_notes));
       }
     );
    }else{
      this.my_notes = JSON.parse(localStorage.getItem('my_notes'));
    }
     setInterval(()=>{
       if(navigator.onLine){
         this.syncronize();
       }else{
         console.log('Offline!');
       }
     }, 5000);
   }
   //listando las notas
   getNotes(){
     return this.afDB.list('/notas');
   }

removeNote(){
  if(navigator.onLine){
    this.afDB.database.ref('notas/' + this.note.id).remove();
  }else{
      this.my_notes.forEach((nota, i) => {
        if(nota.id == this.note.id){
          this.my_notes.splice(i, 1);
        }
      });
      this.my_notes_offline.push({
          id: this.note.id,
          action: 'remove'
        });
    }
    this.show_form = false;
    this.note = {id:null, title:null, description:null};
    localStorage.setItem('my_notes', JSON.stringify(this.my_notes));  
   }
note = {id:null, title:null, description:null};
show_form = false;
editing = false;
  addNote(){
   this.editing = false;
   this.show_form = true;
   this.note = {id:null, title:null, description:null}; 
  }
  viewNote(note){
   this.editing = true;
   this.note = note;
   this.show_form = true;
  }
  cancel(){
   this.show_form = false;
  } 
createNote(){
  if(this.editing){
    if(navigator.onLine){
      this.afDB.database.ref('notas/' + this.note.id).set(this.note);
    }else{
      this.my_notes.forEach((nota) => {
        if(nota.id == this.note.id){
          nota = this.note;
        }
      });
      this.my_notes_offline.push({
          id: this.note.id,
          note: this.note,
          action: 'edit'
        });
      }
    }else{
      this.note.id = Date.now();
      if(navigator.onLine){
        this.afDB.database.ref('notas/' + this.note.id).set(this.note);
      }else{
        this.my_notes.push(this.note);
        this.my_notes_offline.push({
          id: this.note.id,
          note: this.note,
          action: 'create'
        });
      }
    }
      this.show_form = false;
      this.note = {id:null, title:null, description:null};
      localStorage.setItem('my_notes', JSON.stringify(this.my_notes)); 
} 
 syncronize(){
   this.my_notes_offline.forEach((record)=>{
     switch(record.action){
       case 'create':
         this.afDB.database.ref('notas/' + record.note.id).set(record.note);
         break;
       case 'edit':
         this.afDB.database.ref('notas/' + record.note.id).set(record.note);
         break;
       case 'remove':
         this.afDB.database.ref('notas/' + record.id).remove();
         break;
       default:
        console.log('Operacion no soportada');
    }
       this.my_notes_offline.shift();
       console.log(this.my_notes_offline);
   });
  }
}
