import React, { Component } from 'react';
import './App.css';
import shopImageRed from './shop-image-red.svg';
import shopImageBlue from './shop-image-blue.svg';
import shopImagewWite from './shop-image-white.svg';
import beachImage from './beach.svg';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTurn: this.shuffle(['John', 'You', 'Mark']),
      currentBeach: this.createBeachSectors(),
      placedShops: {Mark: 1, John: 2},
      incomeHistory: [],
      nextTurn: false
    }
    this.nextTurn = this.nextTurn.bind(this);
    this.assignPlayerShop = this.assignPlayerShop.bind(this);
  }

  nextTurn() {
    this.setState({nextTurn: true}, this.continueTurn)
  }

  countIncome() {
    let incomeList = [];
    for (let i = 0; i < this.state.currentBeach.length; i++) {
      let distances = [];
      for (let player in this.state.placedShops) {
        const distanceToShop = Math.abs((i + 1) - this.state.placedShops[player]);
        distances.push({
          player: player,
          distanceToShop: distanceToShop
        });
      }
      let closest = {
        distanceToShop: undefined,
        player: undefined
      };
      for (let distance of distances) {
        if (distance.distanceToShop < closest.distanceToShop || closest.distanceToShop === undefined) {
          closest = distance;
        }
      }
      incomeList.push({
        player: closest.player,
        income: this.state.currentBeach[i]
      });
    }
    return incomeList;
  }

  assignPlayerShop(e) {
    const sector = e.target.dataset.num;
    this.placeShop(sector, 'You');
  }

  placeShop(sector, player) {
    let newState = this.state.placedShops;
    newState[player] = sector;
    this.setState({placedShops: newState});
  }

  continueTurn() {
    for (let player of this.state.currentTurn) {
      if (!(player in this.state.placedShops || player == 'You')) {
        this.computerMakeTurn(player);
      } else if (player == 'You' && !('You' in this.state.placedShops)) {
        break;
      }
    }
  }

  computerMakeTurn(player) {
    let randomSector= Math.floor(Math.random() * this.state.currentBeach.length + 1);
    this.placeShop(randomSector, player)
  }
  
  shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
  }

  createBeachSectors() {
    let sectorsCount = Math.floor(Math.random() * 4) + 4;
    let sectorsArray = [];
    for (let i = 0; i < sectorsCount; i++) {
      sectorsArray.push(5 * Math.floor(Math.random() * 19));
    }
    return sectorsArray;
  }

  componentDidUpdate() {
    if (this.state.nextTurn &&
    Object.keys(this.state.placedShops).length === this.state.currentTurn.length) {
      console.log('boom')
      const income = this.countIncome();
      const newIncomeHistory = this.state.incomeHistory;
      newIncomeHistory.push(income);
      this.setState({
        currentTurn: this.shuffle(['John', 'You', 'Mark']),
        currentBeach: this.createBeachSectors(),
        placedShops: {},
        incomeHistory: newIncomeHistory,
        nextTurn: false
      }, this.continueTurn);
    }
  }

  render() {
    let players = [{name:'John', money: 0}, {name:'Mark', money: 0}, {name:'You', money: 0}];
    for (let player of players) {
      for (let turn of this.state.incomeHistory) {
        for (let sector of turn) {
          if (sector.player == player.name) {
            player.money += sector.income;
          }
        }
      }
    }
    players.sort((a, b) => b.money - a.money)

    return (
      <section className='App-grid'>
        <Belt/>
        <Ranking ranking={players}/>
        <TurnOverview sequence={this.state.currentTurn}/>
        <TurnButton handleClick={this.nextTurn} myShopPlaced={('You' in this.state.placedShops)}/>
        <Chart/>
        <Beach handleClick={this.assignPlayerShop} placedShops={this.state.placedShops} sectors={this.state.currentBeach}/>
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
      <li key={props.ranking[0].name} className={isMe(props.ranking[0].name)}>
        {props.ranking[0].name} – {props.ranking[0].money}$
      </li>
      <li key={props.ranking[1].name} className={isMe(props.ranking[1].name)}>
        {props.ranking[1].name} – {props.ranking[1].money}$
      </li>
      <li key={props.ranking[2].name} className={isMe(props.ranking[2].name)}>
        {props.ranking[2].name} – {props.ranking[2].money}$
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

function TurnOverview(props) {
  return (
    <ul className='turn-overview'>
      {props.sequence.map((player) =>
      <li key={player} className='player-turn-container'>
        <p className={isMyName(player)}>{player}</p>
        <img src={isMyShop(player)} />
      </li>
      )}
    </ul>
  )

  function isMyShop(name) {
    if (name === 'You') {
      return shopImageBlue;
    } else {
      return shopImageRed;
    }
  }
  function isMyName(name) {
    if (name === 'You') {
      return 'shop-name-blue';
    }
  }
}

function TurnButton(props) {
  if (props.myShopPlaced) {
    return (
      <button onClick={props.handleClick} className='turn-button'>End turn</button>
    )
  } else {
    return (
      <button className='turn-button' disabled>Place your shop</button>
    )
  }
}

function Chart() {
  return (
    <div className='chart'/>
  )
}

function Beach(props) {
  let counter = 0;
  return (
    <div className='beach-container'>
      <img className='beach-image' src={beachImage}/>
      {props.sectors.map((customers) =>
        <Sector placedShops={props.placedShops} handleClick={props.handleClick} customers={customers} number={counter += 1}/>
      )}
    </div>
  )
}

function Sector(props) {
  return (
    <button data-num={props.number} className={isMyShop(props.number)} onClick={props.handleClick}>
      <p>{props.number}</p>
      {isThereShop(props.number) &&
        <img src={shopImagewWite} />
      }
      <p>{props.customers}</p>
    </button>
  )

  function isThereShop(sector) {
    for (let owner in props.placedShops) {
      if (props.placedShops[owner] == sector) {
        return true;
      }
    }
    return false;
  }

  function isMyShop(sector) {
    if (isThereShop(sector)) {
      for (let owner in props.placedShops) {
        if (owner === 'You' && props.placedShops[owner] == sector) {
          return 'players sector';
        }
      }
      return 'computers sector';
    }
    return 'sector'
  }
}

export default App;