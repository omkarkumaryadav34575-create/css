#include <iostream>
using namespace std;
int main(){
    int n;cin>>n;
    n=(n+1)/2;
    //row
    for (int row=1;row<=n;row++){
        //num
        for (int num=1;num<=row;num++){
            cout<<num;
        }                                        // close num loop here
        //space
        for(int space=1;space<=(2*(n-row)-1);space++){
            cout<<" ";
        }                                        // close space loop here
        //number
        int lastRowNum=row;                      // declared outside the loops
        if(row==n) lastRowNum--;                 // last row: don't repeat the middle number
        for(int num2=lastRowNum;num2>=1;num2--){
            cout<<num2;                          // was: cout
        }
        cout<<endl;
    }
    return 0;
}