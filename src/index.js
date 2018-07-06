import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { createStore, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import Player from './components/Player';
import styles from './app.css';

const style={textTransform:'capitalize'};
function setEpisode(episode)
{
	return {episode,type:'episode'};
}
function setSeason(season)
{
	return {season,type:'season'};
}
function episode(state=1, action)
{
	if(action.type == 'episode')
		return Number(action.episode) || 1;
	else
		return state;
}
function season(state=1, action)
{
	if(action.type == 'season')
		return Number(action.season) || 1;
	else
		return state;
}
const player = combineReducers({episode, season});
const store = createStore(player, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const ReduxPlayer = connect(function(state)
{
	return {
		episode: state.episode,
		season: state.season,
	};
})(Player);

class App extends Component
{
	state =
	{
		episode: 1,
		season: 1,
		movieID: 'kurazh-truslivyj-pes',
	}
	reset()
	{
		this.setState({play: false});
	}
	change = (e) =>
	{
		this.setState({movieID: _.trim(e.target.value)});
		this.reset();
	}
	episode = (e) =>
	{
		this.setState({episode: e.target.value});
		this.reset();
	}
	season = (e) =>
	{
		this.setState({season: e.target.value});
		this.reset();
	}
	play = () =>
	{
		this.props.ep(this.state.episode);
		this.props.s(this.state.season);
		this.setState({play: true});
	}
	render()
	{
		return <Router>
			<div className={styles.main}>
				Welcome to React!
				<div>
					<label>
						ID мультфильма: <input value={this.state.movieID} onChange={this.change} />
					</label>
					{' '}
					<label>
						Сезон: <input type='number' min='1' required value={this.state.season} onChange={this.season}/>
					</label>
					{' '}
					<label>
						Серия: <input type='number' min='0' required value={this.state.episode} onChange={this.episode}/>
					</label>
					<button onClick={this.play} disabled={!this.state.movieID}>Смотреть</button>
					{this.state.play && <Redirect push to={`/${this.state.movieID}`} />}
				</div>
				<Route path='/:id+' component={ReduxPlayer} />
			</div>
		</Router>;
	}
}

const ReduxApp = connect(null, function(dispatch)
{
	return {
		ep(v)
		{
			dispatch(setEpisode(v));
		},
		s(v)
		{
			dispatch(setSeason(v));
		},
	};
})(App);

const root = document.createElement('div');
root.className = styles['app-root'];
document.body.appendChild(root);
ReactDOM.render(<Provider store={store}>
	<ReduxApp />
</Provider>, root);
