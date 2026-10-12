#include <iostream>
using namespace std;
int main(){
    int x1,y1,x2,y2;
    cin>>x1>>y1>>x2>>y2;
    int a=x2-x1;
    int b=y2-y1;
    cout<<"length or rectangle; "<<x2-x1<<endl;
    cout<<"breadth of rect; "<<y2-y1<<endl;
    cout<<"area; "<<a*b<<endl;
    cout<<"paremiter ; "<<2*(a+b)<<endl;

    return 0;
}