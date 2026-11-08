import axios from "axios";
import { parse } from 'node-html-parser';

axios.get('https://weather.bangkok.go.th/Radar/RadarHighResolution.aspx')
									.then(function(response) {
										// console.log(response);
										
										const root = parse(response.data);
										
										//console.log(root.firstChild.structure);
										// ul#list
										//   li
										//     #text
										
										console.log(root.querySelector('#repeaDaily_lblDESCRIPTION_0').childNodes[0]._rawText);
										// { tagName: 'ul',
										//   rawAttrs: 'id="list"',
										//   childNodes:
										//    [ { tagName: 'li',
										//        rawAttrs: '',
										//        childNodes: [Object],
										//        classNames: [] } ],
										//   id: 'list',
										//   classNames: [] }
										//console.log(root.toString());
									})

//<span id="repeaDaily_lblDESCRIPTION_0">(.*?)<\/span>
