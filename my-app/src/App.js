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
      currentTurn: ['John', 'Mark', 'You'],
      currentBeach: this.createBeachSectors(),
      placedShops: {Mark: 1, John: 2},
      incomeHistory: [],
      nextTurn: false,
      buttonBlocked: false,
    }
    this.nextTurn = this.nextTurn.bind(this);
    this.assignPlayerShop = this.assignPlayerShop.bind(this);
  }

  nextTurn() {
    this.setState({nextTurn: true}, this.continueTurn)
  }

  countIncome(shopsConfig) {
    let incomeList = [];
    for (let i = 0; i < this.state.currentBeach.length; i++) {
      let distances = [];
      for (let player in shopsConfig) {
        const distanceToShop = Math.abs((i + 1) - shopsConfig[player]);
        distances.push({
          player: player,
          distanceToShop: distanceToShop
        });
      }
      let closest = [{
        distanceToShop: undefined,
        player: undefined
      }];
      for (let distance of distances) {
        if (distance.distanceToShop < closest[0].distanceToShop || closest[0].distanceToShop === undefined) {
          closest = [distance];
        } else if (distance.distanceToShop === closest[0].distanceToShop) {
          closest.push(distance)
        }
      }
      const income = Math.floor(this.state.currentBeach[i] / closest.length)
      for (let winner of closest) {
        incomeList.push({
          player: winner.player,
          income: income
        })
      }
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
    let bestIncome = 0;
    let bestSector;
    if (this.state.currentTurn.indexOf(player) != 2) {
      let beach = this.state.currentBeach.slice(0)
      for (let shop in this.state.placedShops) {
        beach[this.state.placedShops[shop] - 1] = 0;
      }
      let highestNumOfCustomers = Math.max(...beach);
      bestSector = this.state.currentBeach.indexOf(highestNumOfCustomers) + 1;
    } else {
      let shopsConfig = Object.assign({}, this.state.placedShops);
      for (let i = 0; i < this.state.currentBeach.length; i++) {
        shopsConfig[player] = i + 1;
        let currentIncomeList = this.countIncome(shopsConfig);
        let currentIncome = 0;
        for (let sector of currentIncomeList) {
          if (sector.player === player) {
            currentIncome += sector.income;
          }
        }
        if (currentIncome >= bestIncome) {
          bestIncome = currentIncome;
          bestSector = i + 1;
        }
      }
    }
    this.placeShop(bestSector, player)
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
      const income = this.countIncome(this.state.placedShops);
      const newIncomeHistory = this.state.incomeHistory.slice(0, this.state.incomeHistory.length);
      newIncomeHistory.push(income);
      // setState -> setTimeout as callback -> setState -> setState as callback
      // To give 500 ms before the next turn is started
      this.setState({
        nextTurn: false,
        buttonBlocked: true
      }, () => setTimeout(() => {
        this.setState({
          currentTurn: this.shuffle(['John', 'You', 'Mark']),
          currentBeach: this.createBeachSectors(),
          placedShops: {},
          incomeHistory: newIncomeHistory,
          buttonBlocked: false
        }, this.continueTurn);
      }, 750));
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
        <TurnOverview placedShops={this.state.placedShops} sequence={this.state.currentTurn}/>
        <TurnButton buttonBlocked={this.state.buttonBlocked} handleClick={this.nextTurn} myShopPlaced={('You' in this.state.placedShops)}/>
        <Chart/>
        <Beach buttonDisabled={this.state.buttonBlocked} handleClick={this.assignPlayerShop} placedShops={this.state.placedShops} sectors={this.state.currentBeach}/>
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
      <li key={player} className={'player-turn-container ' + isMyName(player)}>
        <p>{player}</p>
        {(player in props.placedShops) &&
        <React.Fragment>
          <p className='placed-shop-number'>{props.placedShops[player]}</p>
          <img className='placed-shop-image' src={isMyShop(player)} />
        </React.Fragment>
        }
        {!(player in props.placedShops) &&
          <img src={isMyShop(player)} />
        }
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
  if (props.myShopPlaced && !props.buttonBlocked) {
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
        <Sector buttonDisabled={props.buttonDisabled} placedShops={props.placedShops} handleClick={props.handleClick} customers={customers} number={counter += 1}/>
      )}
    </div>
  )
}

function Sector(props) {
  return (
    <button data-num={props.number} disabled={props.buttonDisabled} className={isMyShop(props.number)} onClick={props.handleClick}>
      <p>{props.number}</p>
      {isThereShop(props.number)}
      <p>{props.customers}</p>
    </button>
  )

  function isThereShop(sector) {
    let counter = 0;
    for (let owner in props.placedShops) {
      if (props.placedShops[owner] == sector) {
        counter++;
      }
    }
    if (counter === 1) {
      return <img src={shopImagewWite} />
    } else if (counter > 1) {
      return <p>Contested</p>
    }
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