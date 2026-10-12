#include <iostream>
using namespace std;
int main (){
    int a,b,c;
    cout<<"enter the three sides of a triangle"<<endl;
    cin>>a>>b>>c;
    if (int a+b>c&&b+c>a&&c+a>b){
        cout<<"is a triangle"<<endl;
    } else cout<<"not a triangle"<<endl;


    if (int a==b==c){
        cout<<"a equlateral triangle"<<endl;

    } else if (a==b||b==c||c==a){
        cout<<"isoceles triangle"<<endl;

    } else cout<<"scalene triangle"<<endl;

    
    return 0;
}