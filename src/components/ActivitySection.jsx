import React from 'react'
import Walk from "../assets/Walk.png"
import Read from "../assets/Read.png"
import Swim from "../assets/Swim.png"

const ActivitySection = () => {
    const ActivityCard = ({image, activity, goal, background}) => {
        return (
          <div className={`flex flex-col shadow-md px-4 py-4 w-max items-start pr-24 rounded-3xl ${background}`}>
              <img src={image} alt={image} className='h-8 w-8 mb-2'/>
              <p className='text-black font-medium'>{activity}</p>
              <p className='text-black/50 text-[12px]'>{goal}</p>
          </div>
        )
      }
      return(<div className='flex justify-between overflow-x-scroll gap-6'>
        <ActivityCard image={Walk} activity="Walk" goal="10km" background="bg-[#FCDCD3]"/>
        <ActivityCard image={Swim} activity="Swim" goal="10min" background="bg-[#D7D9FF]"/>
        <ActivityCard image={Read} activity="Read" goal="30min" background="bg-[#D5ECE0]"/>
      </div>)
}

export default ActivitySection