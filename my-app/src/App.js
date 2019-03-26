import React, { Component } from 'react';
import './App.css';

const dummyPropsRanking = {
  first: {
    name: 'You',
    money: 300
  },
  second: {
    name: 'John',
    money: 250
  },
  third: {
    name: 'Mark',
    money: 125
  }
}

class App extends Component {
  render() {
    return (
      <section className='App-grid'>
        <Belt></Belt>
        <Ranking ranking={dummyPropsRanking}></Ranking>
      </section>
    );
  }
}

function Belt() {
  return (
    <nav className='nav-belt'>
      <div className='belt-red-circle'></div>
      <div className='belt-white-circle'></div>
    </nav>
  )
}

function Ranking(props) {
  return (
    <ul className='ranking-container'>
      <li className={isMe(props.ranking.first.name)}>
        {props.ranking.first.name} – {props.ranking.first.money}$
      </li>
      <li className={isMe(props.ranking.second.name)}>
        {props.ranking.second.name} – {props.ranking.second.money}$
      </li>
      <li className={isMe(props.ranking.third.name)}>
        {props.ranking.third.name} – {props.ranking.third.money}$
      </li>
    </ul>
  )

  function isMe(name) {
    if (name === 'You') {
      return 'ranking-me'
    } else {
      return 'ranking-others'
    }
  }
}

export default App;
