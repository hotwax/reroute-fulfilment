<template>
  <ion-page>
    
    
    <ion-content :fullscreen="true">
      <ion-text id="your-order">
        <h1> Your Order</h1>
      </ion-text>
  
    <ion-card>
    

       <ion-item lines="none">
         <ion-label slot="start" >
          
             <h2>customer name</h2>
           
           
             
            <p>order ID</p> 

          
         </ion-label>
         <ion-label slot="end" color="medium" position="fixed">
            order date
         </ion-label>
         
            <!-- <p>order date</p>  -->
        
         
       </ion-item>

       <ion-item lines="full">
         <ion-label>
           <ion-thumbnail>
             <img src="https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y" alt="">
           </ion-thumbnail>
         </ion-label>
         <ion-label>
           <ion-label slot="start">
             <ion-label position="stacked">BRAND</ion-label>
             <list-item-title>
               <h2>Virtual Name</h2>
               
               </list-item-title>
             <ion-label color="medium">color:color</ion-label>
             <ion-label color="medium">Size:size</ion-label>

           </ion-label>
           
         </ion-label>
         
             <ion-badge slot="end" color="primary">status</ion-badge>
          
       </ion-item>

       <ion-item>
         
           <ion-label slot="start">
             <!-- <list-item-title> -->
               Store pickup
             <!-- </list-item-title> -->
           </ion-label>

           <ion-button @click="openPopover" slot="end" color="medium" fill="outline">
             change
             
           </ion-button>
           

          
           

        

       </ion-item>


       <ion-item lines="full">
        <ion-label slot="start">
          Ship to
        </ion-label>
        
          <ion-button slot="end" color="medium" fill="outline">EDIT</ion-button>

       
       </ion-item>
       <ion-item lines="none">
         <ion-label color="danger">
         CANCEL ITEM
             
          
         </ion-label>
       </ion-item>


  
    </ion-card>
    
     
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent,IonPage,  popoverController } from '@ionic/vue';
import { defineComponent } from 'vue';
import Popover from './popover.vue'


export default defineComponent({

  components: {
    IonContent,
    IonPage,
   
  },
  methods: {
    async openPopover(ev: Event) {
      const popover = await popoverController
        .create({
          component: Popover,
          cssClass: 'my-custom-class',
          event: ev,
          translucent: true
        })
      await popover.present();

      const { role } = await popover.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
    },
  },
  
});
</script>

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
#your-order{
  position: absolute;
width: 123px;
height: 31px;
left: calc(50% - 123px/2 + 0.5px);
top: 128px;
visibility: visible;
}
#your-order h1{
  font-size: 26px;
line-height: 120%;
/* or 31px */

text-align: center;
color: rgba(0, 0, 0, 0.87);
}
ion-content{
visibility: visible;
}
#label{
  width: 100px;
  padding: 0;
}
.myCustomSelect{
  max-width: 100% !important;
}

</style>