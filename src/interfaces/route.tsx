export default interface IRoute{
    path:string;
    name:string;
    title:string;
    exact: boolean;
    component:any;
    props?:any;
}