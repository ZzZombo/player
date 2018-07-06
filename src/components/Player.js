import React, { Component } from 'react';
import $ from 'jquery';
import _ from 'lodash';
import styles from './Player.css';

function load(url, referer='')
{
	return $.get({url: `/proxy/${url}`, headers: {'X-Referer': referer}});
}

class PlayerFrame extends Component
{
	url(content)
	{
		return URL.createObjectURL(new Blob([content],{type:'text/html'}));
	}
	constructor(props)
	{
		super(props);
		this.state = {url: this.url(props.content)};
	}
	componentDidUpdate({content})
	{
		if(content != this.props.content)
		{
			URL.revokeObjectURL(this.state.url);
			this.setState({url: this.url(this.props.content)});
		}
	}
	render()
	{
		return <iframe src={this.state.url} className={styles['player-frame']} allowFullScreen />
	}
}

export default class Player extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {content: '<body><i style="color: gray">Загрузка…</i></body>'};
	}
	componentDidUpdate({season,episode})
	{
		if(this.props.season != season || this.props.episode != episode)
			this.componentDidMount();
	}
	componentDidMount()
	{
		const ref = `http://onlinemultfilmy.ru/${this.props.match.params.id}/`;
		const r = load(ref,ref);
		r.done((html) =>
		{
			const series = JSON.parse(html.match(/window\.MP_SETTINGS\s*=\s*\{\s*"SERIES_LIST":\s*(\[[^]*?)\s*}/)[1]);
			_.each(series,(s) =>
			{
				if(s[0].contains('Плеер HD'))
				{
					let url = s[1].substr(0,s[1].indexOf('|'));
					const r = load(url+`?season=${this.props.season}&episode=${this.props.episode}`, ref);
					r.done((contents,_,res) =>
					{
						url = res.getResponseHeader('x-base-url');
						contents = contents.replace('<head>',`<head>\n  <base href="${url}">`);
						const m = contents.match(/window\.video_balancer\s*=\s*new\s+VideoBalancer\s*\(\s*(\{\s*[^]*\s*})\)/);
						const o = Function('return '+m[1])();
						o.adv = {};
						o.episode = this.props.episode;
						o.season = this.props.season;
						o.track_watching = false;
						this.setState(
						{
							content: contents.replace(m[1],JSON.stringify(o)+ String.raw`);
							$.ajaxSetup(
							{
								beforeSend: function(xhr, options)
								{
									if(!options.url.match(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i))
										options.url = '${location.protocol}//${location.host}/proxy/${url}' + (options.url.charAt(0) != '/' ? options.url : options.url.substr(1));
								}
							}`),
						});
					});
				}
			});
		});
	}
	render()
	{
		return <PlayerFrame content={this.state.content} />;
	}
}
