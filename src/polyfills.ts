import 'polyfill-object.fromentries'
import { Buffer } from 'buffer';
import flat from 'array.prototype.flat'
import flatMap from 'array.prototype.flatmap'

flat.shim()
flatMap.shim()
window.Buffer = Buffer;
